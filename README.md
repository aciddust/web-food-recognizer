# 음식판별 웹 데모

AI 기반의 음식 판별 웹 애플리케이션입니다.

카메라로 음식을 촬영하거나 이미지를 업로드하면,

브라우저 내에서 ONNX 모델을 실행하여 서버 없이 클라이언트 사이드에서 추론이 완전히 이루어집니다.

## 기술 스택

| 분류 | 기술 |
| ---- | ---- |
| 프레임워크 | SvelteKit |
| 스타일링 | TailwindCSS |
| UI 컴포넌트 | shadcn-svelte |
| 추론 엔진 | onnxruntime-web (WebGPU / WASM 폴백) |
| 아이콘 | Lucide |
| 모델 호스팅 | Cloudflare R2 |

## 사전 요구 사항

- Node.js 20 이상
- ONNX 형식으로 변환된 YOLOv8 모델 파일 (Cloudflare R2 또는 임의의 공개 URL로 호스팅)

## 설치 및 실행

### 저장소 클론

```bash
git clone <repository-url>
cd web-food-recognizer
```

### 의존성 설치

```bash
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 모델 URL을 설정합니다.

```env
VITE_MODEL_URL=https://your-r2-bucket.example.com/path/to/model.onnx
```

`VITE_MODEL_URL`은 ONNX 모델 파일의 공개 접근 가능한 URL이어야 합니다.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 을 열어 확인합니다.

## 빌드

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```text
src/
  routes/
    /           # 홈 페이지 (이미지 업로드 또는 카메라 진입)
    /camera     # 카메라 촬영 페이지
    /result     # 인식 결과 페이지
  lib/
    onnx/       # ONNX 모델 로드, 전처리, 추론, 후처리 모듈
    stores/     # Svelte 스토어 (추론 상태, 결과 등)
    components/ # 재사용 가능한 UI 컴포넌트
```

## 모델 상세 정보

- 아키텍처: YOLOv8 (한국 음식 데이터셋으로 전이 학습)
- 분류 클래스: 53가지 한국 음식
- 입력 크기: 640 x 640 픽셀
- 실행 환경: WebGPU 우선, 미지원 시 WASM으로 자동 폴백

## 추론 파이프라인

1. 전처리 (Preprocess): 입력 이미지를 640x640으로 리사이즈하고 정규화하여 텐서로 변환합니다.
2. 추론 (Inference): onnxruntime-web을 통해 ONNX 모델을 실행합니다. WebGPU가 지원되는 환경에서는 GPU 가속을 활용합니다.
3. 후처리 (Postprocess): 모델 출력에 NMS(Non-Maximum Suppression)를 적용하여 중복 박스를 제거하고 최종 결과를 반환합니다.
