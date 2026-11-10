# 리뷰 체크리스트 상세

SKILL.md의 체크리스트 각 항목에 대한 판단 기준과 수정 예시.
특정 항목의 판단이 애매할 때 해당 섹션만 참고한다.

## A. 보안·저장 (위반 시 항상 🔴)

### A1. HF 토큰 하드코딩

찾는 것: `hf_`로 시작하는 문자열, `token="..."`, `use_auth_token="..."`, `login(token="...")`

```python
# ❌
model = AutoModelForCausalLM.from_pretrained(name, token="hf_xxxxxxxx")

# ✅ 환경변수 사용 (또는 huggingface-cli login 후 token 인자 생략)
import os
model = AutoModelForCausalLM.from_pretrained(name, token=os.environ.get("HF_TOKEN"))
```

이미 커밋된 토큰을 발견하면: 코드 수정만으로는 부족하다. huggingface.co/settings/tokens 에서 해당 토큰을 폐기(revoke)하라고 반드시 안내한다.

### A2. 비밀 파일

`.env`, `*.pem`, `*.key`, W&B·OpenAI 키 등. `.env.example`처럼 값이 비어 있는 템플릿은 허용.

### A3. 대용량·생성 파일

| 패턴 | 이유 |
| --- | --- |
| `*.safetensors`, `*.bin`, `*.pt`, `*.pth`, `*.ckpt`, `*.gguf` | 모델 가중치 — HF Hub에 올린다 |
| `checkpoint-*/`, `outputs/` | Trainer 출력 |
| `wandb/`, `runs/`, `mlruns/` | 실험 로그 |
| 10MB 초과 파일 | 데이터셋 등 — HF Hub 또는 Git LFS |

### A4. `.gitignore`

최소한 아래가 들어 있어야 한다. 없으면 🟡로 추가 제안.

```gitignore
*.safetensors
*.bin
*.pt
*.ckpt
checkpoint-*/
outputs/
wandb/
.env
```

### A5. push_to_hub

`push_to_hub=True` 또는 `.push_to_hub()`가 있으면 `private=True`(또는 `hub_private_repo=True`) 여부를 확인한다. 의도적 공개라면 넘어가되 리뷰에 한 줄 언급.

## B. 재현성 (기본 🟡, 실험 결과 비교·보고용 코드면 🔴)

### B1. 시드

```python
from transformers import set_seed
set_seed(42)                                   # torch/numpy/random 일괄
args = TrainingArguments(..., seed=42, data_seed=42)
ds = ds.shuffle(seed=42)
split = ds.train_test_split(test_size=0.1, seed=42)
```

`shuffle()`, `train_test_split()`에 seed가 없으면 지적한다.

### B2. 하이퍼파라미터 한 곳 관리

lr, epoch, batch size, LoRA r/alpha 등이 여러 파일에 숫자로 흩어져 있으면 지적. YAML/JSON config 또는 dataclass 하나로 모으도록 제안.

### B3. 의존성 버전 고정

`requirements.txt`에서 핵심 라이브러리는 `==`로 고정:
`torch`, `transformers`, `datasets`, `peft`, `trl`, `accelerate`, `bitsandbytes`(사용 시)

### B4. revision 고정

```python
AutoModelForCausalLM.from_pretrained("org/model", revision="<commit-hash 또는 태그>")
load_dataset("org/dataset", revision="<commit-hash>")
```

필수는 아니고 🟢 제안 수준. 단, 논문·보고용 실험이면 🟡.

### B5. config 저장

학습 결과물 폴더에 사용한 config를 함께 저장하는지 확인.

```python
shutil.copy(config_path, os.path.join(args.output_dir, "train_config.yaml"))
```
