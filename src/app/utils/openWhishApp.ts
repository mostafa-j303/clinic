export function openWhishApp(): void {
  const userAgent =
    navigator.userAgent || (navigator as any).vendor || (window as any).opera;

  const isAndroid = /android/i.test(userAgent);
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

  if (isAndroid) {
    window.open("whish://", "_blank");

    setTimeout(() => {
      window.open(
        "https://play.google.com/store/apps/details?id=money.whish.android",
        "_blank"
      );
    }, 1500);
  } else if (isIOS) {
    window.open("whish://", "_blank");

    setTimeout(() => {
      window.open(
        "https://apps.apple.com/lb/app/whish/id6469056123",
        "_blank"
      );
    }, 1500);
  } else {
    window.open("https://apps.whish.money", "_blank");
  }
}
