#!/usr/bin/env python3
"""Scan a memory dump for response payload offsets.

This script searches a binary "memory" file for a server response payload and
reports all offsets where the response appears. It supports reading the
response from a file, hex string, or plain text.
"""

from __future__ import annotations

import argparse
import binascii
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ScanResult:
    offset: int
    context: bytes


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Scan a memory dump for response payload offsets and report matches."
        )
    )
    parser.add_argument(
        "--memory",
        required=True,
        type=Path,
        help="Path to the memory dump file to scan.",
    )
    response_group = parser.add_mutually_exclusive_group(required=True)
    response_group.add_argument(
        "--response",
        type=Path,
        help="Path to the response payload file to locate in memory.",
    )
    response_group.add_argument(
        "--response-hex",
        help="Response payload as a hex string (e.g., deadbeef).",
    )
    response_group.add_argument(
        "--response-text",
        help="Response payload as plain text (UTF-8).",
    )
    parser.add_argument(
        "--context",
        type=int,
        default=16,
        help="Number of bytes to show before/after each match (default: 16).",
    )
    return parser.parse_args()


def load_response_payload(args: argparse.Namespace) -> bytes:
    if args.response is not None:
        return args.response.read_bytes()
    if args.response_hex is not None:
        try:
            return binascii.unhexlify(args.response_hex)
        except binascii.Error as exc:
            raise SystemExit(f"Invalid hex string: {exc}") from exc
    if args.response_text is not None:
        return args.response_text.encode("utf-8")
    raise SystemExit("No response payload provided.")


def find_all_offsets(memory: bytes, needle: bytes, context: int) -> list[ScanResult]:
    if not needle:
        raise SystemExit("Response payload is empty; nothing to scan.")

    results: list[ScanResult] = []
    start = 0
    while True:
        offset = memory.find(needle, start)
        if offset == -1:
            break
        context_start = max(offset - context, 0)
        context_end = min(offset + len(needle) + context, len(memory))
        results.append(ScanResult(offset=offset, context=memory[context_start:context_end]))
        start = offset + 1
    return results


def format_context(context: bytes) -> str:
    return binascii.hexlify(context, sep=" ").decode("ascii")


def main() -> None:
    args = parse_args()
    memory = args.memory.read_bytes()
    response_payload = load_response_payload(args)

    matches = find_all_offsets(memory, response_payload, args.context)

    print(f"Memory size: {len(memory)} bytes")
    print(f"Response size: {len(response_payload)} bytes")
    print(f"Matches found: {len(matches)}")

    for match in matches:
        print(
            "\n".join(
                [
                    f"Offset: {match.offset} (0x{match.offset:x})",
                    f"Context ({len(match.context)} bytes): {format_context(match.context)}",
                ]
            )
        )


if __name__ == "__main__":
    main()
