const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let isInitialized = false;

export const initializeGA = (): void => {
  if (isInitialized || !GA_MEASUREMENT_ID) return;
  isInitialized = true;

  window.dataLayer = window.dataLayer || [];

  // GA4 gtag()는 arguments 객체를 dataLayer에 그대로 push해야 동작함.
  // 화살표 함수는 arguments를 바인딩하지 않고, rest params는 Array로 변환되어
  // GA4가 이벤트를 인식하지 못하기 때문에 function 키워드 + arguments 사용이 필요.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    transport_type: "beacon",
    ...(import.meta.env.DEV && { debug_mode: true }),
  });

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);
};

export const sendPageView = (path: string, title?: string): void => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag("event", "page_view", {
    page_path: path,
    ...(title && { page_title: title }),
  });
};

export const sendEvent = (name: string, params?: Record<string, unknown>): void => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag("event", name, params);
};
