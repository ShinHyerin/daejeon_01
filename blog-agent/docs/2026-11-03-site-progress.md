# 유라클 블로그 사이트 제작 기록

승인한 설계: `docs/2026-11-03-blog-site-design.md`
구현 계획: `docs/superpowers/plans/2026-11-03-uracle-blog.md`

## 식별 정보

- Site ID: `appgprj_6ae9935f21c48191a39ef0fca6224e97`
- 작업 폴더: `sites/uracle-blog/`
- 주소: https://uracle-journal-20261103.day1companyk-6083.chatgpt.site
- 접근 범위: 신규 owner-private. 공개 전환 요청 없음.
- 운영: 요청형 작성·게시. 자동 예약 없음.

## 구현과 검증

- Task 1 complete: 구조화 원고와 HTML 생성. 새 공식 사업 소개 글 1편 작성. 중복·날짜·출처·HTML escape·직접 본문 테스트.
- Task 2 complete: 공식 사진과 로고, 흰색/검정/빨강 디자인, 검색과 분류, 빈 결과 및 초기화. 홈페이지와 글 페이지 HTTP 200. 390px 화면에서 가로 넘침 없고 이미지 정상 로딩.
- 별도 코드 검토: Critical 없음, Important 2건, Minor 없음.
- Final fixed: 읽기 시간의 HTML 삽입 — 실패 테스트로 재현 후 정수 검증과 안전한 출력으로 수정.
- Final fixed: 중단한 빌드의 이전 글 잔존 — 실패 테스트로 재현 후 매 빌드의 독립 임시 폴더·정리로 수정.
- 최종 동작 테스트 8/8 통과, 정적 빌드 성공.
- 검토자가 맡지 않은 모바일 화면·이미지 비율·원문 사실 대조는 주 담당 에이전트가 확인했다. 배포는 아래 결과로 별도 기록한다.

## 운영상의 결정

- Ruling: 기존 프로젝트가 Git 저장소가 아니므로 새 Site 전용 하위 폴더를 독립 checkout으로 사용한다. 기존 조사 파일은 이동하지 않는다.
- Ruling: Windows의 도구 실행 계정과 폴더 소유자 차이로 Git 연결이 실패했다. 신뢰 범위를 이 새 Site 폴더 하나에 한정한 프로세스 환경 설정으로 해결했다. 전역 Git 설정은 변경하지 않았다.
- Ruling: 사용자 승인한 요청형 작성·게시를 직접 구현한다. 같은 범위의 추가 실행 방식 승인은 요청하지 않는다.
- 사이트 내부 Drive 직접 연결과 정기 실행은 구현 범위에 포함하지 않는다.

## 배포 결과

- 배포 성공: 2026-11-03 17:09:39 한국시간. native Sites 응답의 status가 `succeeded`이며 실패 메시지가 없다.
- 소스 commit: `f7b93afd3aa9d29fee1eaf9250a75b9eb9bba8d6`
- 저장 버전 ID: `appgprj_6ae9935f21c48191a39ef0fca6224e97~appgver_bba43dd16fc48191a1129018994ad5e4`
- 배포 ID: `appgdep_6ae996b52f2c8191b154335f5b016bd9`
- 홈페이지: https://uracle-journal-20261103.day1companyk-6083.chatgpt.site
- 첫 글: https://uracle-journal-20261103.day1companyk-6083.chatgpt.site/posts/uracle-ai-mobile-overview/
- 실제 배포 주소를 열었을 때 owner-private의 ChatGPT 로그인 화면이 표시됐다. 로컬 시각·기능 검증과 native 배포 성공을 확인했으며, 로그인한 방문자의 hosted 본문 열람까지 검증했다고 주장하지 않는다.
- Task 3 complete: 소스 push·archive 저장·비공개 배포 성공, 운영 문서와 프로젝트 지침 저장. 별도 정기 작업 없음.

## 저장 초안 3편 게시와 채팅 명령 추가

사용자 요청: “블로그 초안을 바탕으로 블로그에 게시”, 채팅 명령 “글 게시”로 같은 사이트에 게시.

- 게시한 초안: 오르다 API 게이트웨이, 맥 스튜디오 코드어시스턴트, 모피어스 UMS. 기존 소개 글을 포함해 총 4편.
- 기존 초안의 핵심 사실·강조 2곳·하단 요약을 유지하며 게시 형식으로 편집했다. 기사 원문을 다시 확인했고, 원문 발행일과 사이트 게시일을 구분했다.
- 오르다 기사는 웹 텍스트 도구가 열지 못했으나 브라우저에서 디지털투데이의 기사 본문·기자·발행일을 확인했다. 나머지 두 전자신문 기사도 본문을 확인했다. 기존 블로그의 미래에셋증권 메시징 시스템 구축 글을 읽고 고객의 메시지 운영 필요를 쉽게 설명하는 도입 구성을 참고했으며, 과거 사례의 수치를 새 기사의 사실로 가져오지 않았다.
- `AGENTS.md`, 프로젝트 README, 사이트 README에 “글 게시” 명령을 기록했다. 가장 최근의 완성된 미게시 초안을 우선하고, 기본 한 편씩 게시한다. 지정된 여러 편은 해당 범위대로 처리한다. 미게시 초안이 없으면 알린다.
- `sites/uracle-blog/content/publications.json`에 원본 경로·사건·게시 주소를 기록했다. 이전 배포가 실패했으면 기록만으로 완료 처리하지 않는 규칙을 사이트 README에 명시했다.
- 검증: 전체 테스트 8/8 통과, 4편 빌드 성공, 새 3편의 실제 HTML·제목·출처·강조·게시 기록 일치 확인.
- 소스 commit: `6b9d9284828a1c12e811a2e828d974945333082f`
- 저장 버전: `appgprj_6ae9935f21c48191a39ef0fca6224e97~appgver_e861cf0048048191a5db11b7fd0f3531`
- 배포 ID: `appgdep_6ae998e375d08191b7249eb3df8e0207`
- 배포 성공: 2026-11-03 17:18:56 한국시간. Sites native 응답 `succeeded`, 실패 메시지 없음. 기존 owner-private 접근 유지.

게시 주소:

- https://uracle-journal-20261103.day1companyk-6083.chatgpt.site/posts/aurda-api-gateway-launch/
- https://uracle-journal-20261103.day1companyk-6083.chatgpt.site/posts/mac-studio-code-assistant/
- https://uracle-journal-20261103.day1companyk-6083.chatgpt.site/posts/morpheus-ums-growth/

## 글별 썸네일 4개와 최종 흑백 사진 스타일

- 4편이 홈페이지 사진을 같이 사용하던 문제를 수정했다. 글별 `thumbnail` 메타데이터를 추가해 목록과 본문 대표 이미지에 각기 다른 이미지를 연결했다. 홈페이지 상단 회사 사진은 유지한다.
- 처음 만든 저채도 일러스트 시안은 사용자 추가 지시에 따라 교체했다. 최종 기준은 참고 스크린샷의 사진형 뉴스 썸네일 구성이다. 글의 주제에 맞는 흑백 사진 위에 검은색 반투명 보정을 하고, 흰색 큰 글자를 중앙에 3줄로 배치했다. 컬러 틴트를 없애기 위해 표시 스타일에도 grayscale(1)을 적용했다.
- 생성 방식: 내장 image_gen. 생성 사진은 설명용 이미지이며 회사의 실제 현장 사진이라고 표기하지 않는다. 각 본문에 ‘글 내용을 바탕으로 제작한 이미지’라고 표시한다.
- 저장 파일: `sites/uracle-blog/assets/thumb-uracle-overview-mono.png`, `thumb-aurda-gateway-mono.png`, `thumb-mac-studio-mono.png`, `thumb-morpheus-ums-mono.png`. 모두 1536×1024.
- 전체 생성 문구·프롬프트: `sites/uracle-blog/content/thumbnail-production-mono.json`. 이전 시안의 생성 원본은 기본 생성 보관 위치와 Git 이력에 남기고, 배포 assets에서는 이전 시안 4개를 제외했다.
- 검증: 전체 테스트 10/10 통과, 4편 빌드 성공. 데스크톱과 390px 모바일에서 4개 이미지 로딩, 3:2 비율, contain 표시, 가로 넘침 없음, grayscale(1) 확인. 썸네일 지원 코드 변경은 별도 검토에서 중요한 문제 없음으로 확인했다.
- 프로젝트 AGENTS.md에 앞으로 사용할 사진·검은 반투명·흰 글자 기준을 반영했다.
- 소스 commit: `c0885f82d3123b1df81fb4c2099aba85ea4564fb`
- 저장 버전: `appgprj_6ae9935f21c48191a39ef0fca6224e97~appgver_89565da6e11881918eb58824bce16cd5`
- 배포 ID: `appgdep_6ae99f367ea08191af7271c535010e30`
- 배포 성공: 2026-11-03 17:45:57 한국시간. native Sites 응답 `succeeded`, 실패 메시지 없음. 기존 비공개 접근 범위 유지.
