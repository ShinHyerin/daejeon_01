#!/usr/bin/env python3
"""SLM 프로젝트 보안·저장 스캔.

커밋 대상 파일에서 HF 토큰/비밀값, 대용량·생성 파일, .gitignore 누락을 찾아
결과만 짧게 출력한다. 🔴 항목이 있으면 종료 코드 1.

사용법 (저장소 루트에서):
    python scan_secrets.py            # 스테이징된 파일만
    python scan_secrets.py --all      # 스테이징 + 수정 + 추적 안 된 파일
"""
import fnmatch
import os
import re
import subprocess
import sys

MAX_MB = 10

SECRET_PATTERNS = [
    ("HF 토큰", re.compile(r"hf_[A-Za-z0-9]{30,}")),
    ("하드코딩 token 인자", re.compile(r"""(?:use_auth_token|token)\s*=\s*["'][^"'\s]{8,}["']""")),
    ("API 키/비밀번호", re.compile(r"""(?i)(?:api[_-]?key|secret|password)\s*[=:]\s*["'][^"'\s]{8,}["']""")),
    ("OpenAI 키", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}")),
    ("W&B 키", re.compile(r"""(?i)wandb[_a-z]*\s*[=:(]\s*["']?[0-9a-f]{40}""")),
]

BLOCKED_FILES = [
    "*.safetensors", "*.bin", "*.pt", "*.pth", "*.ckpt", "*.gguf", "*.onnx",
    ".env", ".env.*", "*.pem", "*.key",
]
BLOCKED_DIRS = ["checkpoint-*", "outputs", "wandb", "runs", "__pycache__", ".cache", "mlruns"]

GITIGNORE_REQUIRED = [
    "*.safetensors", "*.bin", "*.pt", "*.ckpt", "checkpoint-*/", "outputs/", "wandb/", ".env",
]


def git(*args):
    r = subprocess.run(["git", *args], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.exit(f"git 오류: {r.stderr.strip()}")
    return [l for l in r.stdout.splitlines() if l.strip()]


def target_files(include_all):
    files = set(git("diff", "--cached", "--name-only", "--diff-filter=ACMR"))
    if include_all:
        files |= set(git("diff", "--name-only", "--diff-filter=ACMR"))
        files |= set(git("ls-files", "--others", "--exclude-standard"))
    return sorted(files)


def blocked_reason(path):
    name = os.path.basename(path)
    for pat in BLOCKED_FILES:
        if fnmatch.fnmatch(name, pat):
            return f"차단 패턴 {pat}"
    for part in path.replace("\\", "/").split("/")[:-1]:
        for pat in BLOCKED_DIRS:
            if fnmatch.fnmatch(part, pat):
                return f"생성 폴더 {pat}/"
    if os.path.isfile(path) and os.path.getsize(path) > MAX_MB * 1024 * 1024:
        return f"{os.path.getsize(path) / 1024 / 1024:.1f}MB (>{MAX_MB}MB)"
    return None


def scan_content(path):
    hits = []
    try:
        with open(path, "r", encoding="utf-8") as f:
            for i, line in enumerate(f, 1):
                for label, pat in SECRET_PATTERNS:
                    if pat.search(line):
                        hits.append((i, label))
    except (UnicodeDecodeError, OSError):
        pass  # 바이너리·읽기 불가 파일은 건너뜀
    return hits


def missing_gitignore():
    if not os.path.isfile(".gitignore"):
        return GITIGNORE_REQUIRED
    with open(".gitignore", encoding="utf-8", errors="replace") as f:
        lines = {l.strip() for l in f}
    return [p for p in GITIGNORE_REQUIRED if p not in lines and p.rstrip("/") not in lines]


def main():
    include_all = "--all" in sys.argv
    root = git("rev-parse", "--show-toplevel")[0]
    os.chdir(root)

    files = target_files(include_all)
    red, yellow = [], []

    for path in files:
        reason = blocked_reason(path)
        if reason:
            red.append(f"{path} — 커밋 금지 파일 ({reason})")
            continue
        for line, label in scan_content(path):
            red.append(f"{path}:{line} — {label} 의심")

    missing = missing_gitignore()
    if missing:
        yellow.append(".gitignore 누락: " + ", ".join(missing))

    scope = "스테이징+작업트리" if include_all else "스테이징"
    print(f"[scan] 대상 {len(files)}개 파일 ({scope})")
    for r in red:
        print(f"🔴 {r}")
    for y in yellow:
        print(f"🟡 {y}")
    if not red and not yellow:
        print("✅ 보안·저장 스캔 통과")
    sys.exit(1 if red else 0)


if __name__ == "__main__":
    main()
