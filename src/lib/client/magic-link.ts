export const MAGIC_LINK_VERIFY_ROUTE = "/magic-link/verify";
export const MAGIC_LINK_SUCCESS_REDIRECT = "/dashboard/student";

type RouterLike = {
  push: (href: string) => void;
};

type VerifyMagicLinkOptions = {
  token: string;
  loginWithMagicLink: (token: string) => Promise<void>;
  router: RouterLike;
  redirectTo?: string;
};

export async function verifyMagicLinkAndRedirect({
  token,
  loginWithMagicLink,
  router,
  redirectTo = MAGIC_LINK_SUCCESS_REDIRECT,
}: VerifyMagicLinkOptions) {
  await loginWithMagicLink(token);
  router.push(redirectTo);
}
