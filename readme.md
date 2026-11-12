# L.L.M Academy - 대전 1기

## 파일 구성

| 경로 | 설명 |
|---|---|
| `CLAUDE.md` | Claude가 이 저장소에서 지킬 규칙 (민감정보 금지, 변경 전 확인, 커밋 형식 등) |
| `.gitignore` | `.env`, 키 파일 등 인증 자료가 커밋되지 않도록 제외 |
| `SLM_proj/` | Hugging Face를 이용한 SLM 개발 프로젝트 |
| `SLM_proj/README.md` | SLM 프로젝트 소개 |
| `SLM_proj/skills-draft/agents/slm-reviewer.md` | 코드 리뷰 전담 에이전트. 변경분을 보안·재현성 기준으로 점검하고 결과만 보고 (파일 수정·커밋 안 함) |
| `SLM_proj/skills-draft/skills/slm-review-commit/SKILL.md` | 코드 리뷰와 Conventional 커밋 메시지 작성 스킬 |
| `SLM_proj/skills-draft/skills/slm-review-commit/references/checklist.md` | 리뷰 체크리스트 상세 (HF 토큰 하드코딩, 비밀 파일 등 판단 기준과 수정 예시) |
| `SLM_proj/skills-draft/skills/slm-review-commit/scripts/scan_secrets.py` | 커밋 대상에서 토큰·비밀값, 대용량 모델 파일, .gitignore 누락을 찾는 스캔 스크립트 |
| `code-agent-team/` | 코드 에이전트 팀 구성안 (메인 1 + 탐색 + 검수) |
| `code-agent-team/README.md` | 구성안 요약 |
| `code-agent-team/code-agent-team.html` | 구성안을 보여 주는 페이지 (브라우저로 열기) |
| `persona_cjm/` | 어떤 산업(게임, 뷰티 영상, 팝업/전시, 여행·웰니스)에도 재사용하는 퍼소나·고객여정지도(CJM) 기획 작업 폴더 |
| `persona_cjm/.claude/skills/persona-cjm/SKILL.md` | BRAND/ITEM/TARGET/SITUATION 슬롯만 바꿔 5-Whys 퍼소나와 6단계 CJM을 도출하고, 모드 A(15초 릴스)·B(팝업/전시)·C(테마 투어) 기획서를 HTML로 출력하는 스킬 |
| `persona_cjm/genshin_persona_cjm.md` | 스킬 적용 사례: 원신 복귀 유저 5-Whys 퍼소나와 훅 주체(공식/크리에이터/커뮤니티)를 나눈 6단계 CJM |
