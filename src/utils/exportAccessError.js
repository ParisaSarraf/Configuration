import { Modal } from "antd";

export const isAuthorizationError = (error) =>
  [401, 403].includes(Number(error?.response?.status));

export const showAuthorizationError = (error, action) => {
  const isUnauthenticated = Number(error?.response?.status) === 401;
  Modal.warning({
    title: "دسترسی امکان‌پذیر نیست",
    content: isUnauthenticated
      ? `برای ${action} دسترسی ندارید یا نشست شما منقضی شده است. در صورت نیاز دوباره وارد شوید.`
      : `شما دسترسی لازم برای ${action} را ندارید.`,
    okText: "متوجه شدم",
    centered: true,
  });
};
