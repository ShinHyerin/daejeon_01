# Uracle Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 요청할 때 에이전트가 글을 작성하고 게시하는 유라클 블로그를 제작하고 첫 글을 배포한다.

**Architecture:** 새 독립 Site 디렉터리에 의존성 없는 정적 페이지 생성기를 둔다. 구조화한 원고에서 홈페이지, 글별 HTML, 검색 색인을 만들고 Sites 소스 저장소와 배포 버전을 연결한다. Drive의 사이트 내부 연결과 정기 실행은 추가하지 않는다.

**Tech Stack:** Node.js 내장 모듈, HTML/CSS/JavaScript, Sites 정적 호스팅.

**Spec:** `docs/2026-11-03-blog-site-design.md` (사용자 승인: 2026-11-03).

## Global Constraints

- 흰 배경, 본문 `#1D1D1B`, 포인트 `#E30613`.
- 공식 로고 비율 유지, 공식 회사 사진을 대표 영역에 사용한다.
- 글마다 출처와 원문 발행일/확인일, 실제 게시일을 구분한다.
- 새 Site는 비공개이며 정기 예약은 만들지 않는다.
- 사용자에게 글쓰기나 배포 조작을 맡기지 않는다.

## Review Focus

- 빈 검색 결과와 검색 초기화: 현재 상태를 명확히 표시한다.
- 긴 한국어 제목과 모바일 너비: 가로 넘침 없이 읽힌다.
- 콘텐츠 속 HTML 기호: 텍스트를 안전하게 escape한다.
- 잘못된 원고와 중복 주소: 기존 배포 산출물을 덮기 전에 실패한다.
- 글 주소 직접 방문: 자바스크립트 없이 본문이 제공된다.

## Task 1: 콘텐츠와 정적 생성

**Files:** `sites/uracle-blog/content/posts.json`, `lib/site.mjs`, `scripts/build.mjs`, `tests/site.test.mjs`.

**Interfaces:** `validatePosts(posts)`는 잘못된 slug, 중복, 출처 누락, 미래 게시일을 거절한다. `renderHome(posts)`, `renderPost(post)`는 안전한 HTML을 반환한다. 빌드는 `dist/index.html`, `dist/posts/<slug>/index.html`, `dist/assets/`를 만든다.

- [x] 잘못된 원고, 중복 slug, HTML escape, 첫 글 직접 읽기의 실패 테스트를 먼저 실행한다.
- [x] 공식 홈페이지와 관련 기존 블로그를 읽고 첫 소개 글 1편을 작성한다.
- [x] 생성기를 구현하고 `node --test`가 통과하는지 확인한다.

## Task 2: 디자인과 탐색

**Files:** `assets/style.css`, `assets/app.js`, `assets/uracle-logo.png`, `assets/uracle-office.png`.

**Interfaces:** 홈에 연결한 `data-post` 요소를 `searchPosts(posts,{query,category})`로 필터링한다. 빈 결과, 결과 수, 검색 초기화를 제공한다.

- [x] 검색·분류 결합 및 빈 결과·한국어 공백 검색의 실패 테스트를 먼저 실행한다.
- [x] 공식 사진과 로고를 확보하고 흰색 편집형 홈페이지, 읽기 쉬운 글 페이지를 구현한다.
- [x] 테스트와 로컬 미리보기로 사진·링크·검색·모바일 표시를 확인한다.

## Task 3: 검토, 게시, 운영 기록

**Files:** Site의 `.openai/hosting.json`, `README.md`, 이 프로젝트의 `docs/2026-11-03-site-progress.md`.

- [x] fresh reviewer에게 코드와 요구사항을 검토받고 중요한 결함을 수정한다.
- [x] 전체 테스트와 빌드를 실행한다.
- [x] Sites 소스 helper로 검증한 소스를 push하고 산출물 archive를 만든다.
- [x] owner-private 배포 도구로 게시하고 terminal success와 글 주소를 확인한다.
- [x] Site ID, 폴더, 게시 목록, 후속 게시 절차를 기록한다. 자격 증명은 기록하지 않는다.

## Execution ledger

- 사용자 승인한 구현·게시를 이번 세션에서 직접 실행한다. 동일 범위의 재승인이나 별도 실행 방식 선택은 요청하지 않는다.
- 기존 프로젝트 루트는 저장소 여부를 확인하고, 새 Site 전용 하위 폴더를 독립 checkout으로 사용한다.
