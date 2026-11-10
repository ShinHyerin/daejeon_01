---
name: slm-review-commit
description: 허깅페이스 기반 SLM 프로젝트의 코드 리뷰(보안·재현성 점검)와 Conventional 한글 커밋 메시지 작성. 학습·데이터·평가 코드를 검토하거나, git 커밋·푸시 전에 확인하거나, 커밋 메시지를 만들 때 사용. "리뷰해줘", "점검해줘", "검토해줘", "코드 봐줘", "올려도 돼?", "푸시해도 괜찮아?", "커밋해줘", "커밋 메시지 써줘", "변경사항 정리해서 커밋", "review", "commit", "LGTM?" 같은 요청에 적용.
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(python:*)
---

# SLM 코드 리뷰 & 커밋

이 스킬은 두 가지 작업을 다룬다. 요청에 맞는 쪽만 수행한다.

- **리뷰**: 변경된 코드를 보안·저장, 재현성 기준으로 점검
- **커밋**: 변경사항을 정해진 형식의 커밋 메시지로 커밋

코드는 직접 수정하지 않는다. 수정이 필요하면 리뷰 결과에 수정 예시로만 제시한다.

## 보안 스캔 스크립트

보안·저장 항목은 직접 훑지 말고 스크립트로 먼저 확인한다. 저장소 루트에서:

```bash
python ~/.claude/skills/slm-review-commit/scripts/scan_secrets.py        # 스테이징된 파일
python ~/.claude/skills/slm-review-commit/scripts/scan_secrets.py --all  # 작업트리 전체 변경분
```

출력된 🔴/🟡 줄을 리뷰 결과에 그대로 반영한다. 종료 코드 1이면 🔴가 있다는 뜻이다.
`python`이 없으면 `python3` 또는 `py`로 실행한다.

## 1. 리뷰

### 절차

1. `git status`, `git diff HEAD`로 변경 범위 확인 (사용자가 파일을 지정하면 그 파일만)
2. `scan_secrets.py --all` 실행 → 체크리스트 A 결과 확보
3. 변경 파일을 Read로 읽고 체크리스트 B를 점검
4. 판단이 애매한 항목은 `references/checklist.md`의 해당 섹션을 읽고 결정

### 체크리스트 A — 보안·저장 (위반 시 항상 🔴)

- A1. HF 토큰 하드코딩 없음 → 환경변수 `HF_TOKEN` 사용
- A2. `.env`, API 키, 비밀 파일이 커밋 대상에 없음
- A3. 모델 가중치·체크포인트·로그 폴더·10MB 초과 파일이 커밋 대상에 없음
- A4. `.gitignore`에 위 패턴이 있음 (누락은 🟡)
- A5. `push_to_hub` 사용 시 `private=True` 여부 확인

토큰이 이미 커밋 이력에 있으면 토큰 폐기(revoke)를 반드시 안내한다.

### 체크리스트 B — 재현성 (기본 🟡, 실험 결과 비교·보고용 코드면 🔴)

- B1. 시드 고정: `set_seed`, `TrainingArguments(seed=)`, `shuffle`/`train_test_split`의 `seed`
- B2. 하이퍼파라미터를 config 파일 한 곳에서 관리
- B3. `requirements.txt`에 핵심 라이브러리 버전 `==` 고정
- B4. 모델·데이터셋 `revision=` 고정 (기본 🟢)
- B5. 학습 결과물과 함께 사용한 config 저장

### 출력 형식

심각도별로 묶어 보고한다. 해당 없는 등급은 생략한다. 문제가 없으면 "체크리스트 통과" 한 줄.

```
## 리뷰 결과: <대상 요약>

### 🔴 필수 (커밋 전 반드시 수정)
- `train.py:12` [A1] HF 토큰이 하드코딩됨
  → `token=os.environ.get("HF_TOKEN")`

### 🟡 권장
- `train.py:40` [B1] 시드 미고정 → `set_seed(42)` 추가

### 🟢 제안
- [B2] 하이퍼파라미터를 `configs/train.yaml`로 분리하면 실험 비교가 쉬워짐

### 요약
필수 1 · 권장 1 · 제안 1 — 🔴 항목 수정 후 커밋 권장
```

## 2. 커밋

### 절차

1. `git status`, `git diff --staged`로 커밋될 내용 확인 (스테이징이 비어 있으면 무엇을 스테이징할지 사용자에게 묻는다)
2. `scan_secrets.py` 실행 — 🔴가 있으면 커밋하지 않고 먼저 알린다
3. 아래 형식으로 메시지를 작성해 사용자에게 보여주고 확인을 받는다
4. 확인되면 `git commit` 실행

### 메시지 형식 — Conventional Commits + 한글

```
<type>(<scope>): <한글 요약, 50자 이내, 마침표 없음>

<본문: 무엇을, 왜 바꿨는지 한글로. 필요할 때만>
```

| type | 용도 |
| --- | --- |
| feat | 새 기능 |
| fix | 버그 수정 |
| refactor | 동작 변화 없는 구조 개선 |
| exp | 실험 설정·하이퍼파라미터 변경 |
| docs | 문서 |
| chore | 의존성, 설정, 기타 |

scope는 아래 목록에서만 고른다. 여러 개에 걸치면 가장 중심이 되는 하나.

| scope | 대상 |
| --- | --- |
| data | 데이터셋 로드·전처리·포맷 변환 |
| train | 학습 스크립트, Trainer, LoRA/SFT |
| eval | 평가, 지표, 추론 테스트 |
| model | 모델 구조, 토크나이저, 로드·저장 |
| config | 하이퍼파라미터, YAML 설정 |
| infra | 환경, 의존성, 스크립트, CI |

### 예시

```
feat(train): LoRA SFT 학습 스크립트 추가
fix(data): chat template 적용 시 eos 토큰 누락 수정
chore(infra): transformers 버전 고정
exp(config): learning rate 2e-4 → 1e-4로 변경

loss가 초반에 발산해서 낮춤
```
