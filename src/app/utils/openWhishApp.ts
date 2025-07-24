export function openWhishApp(): void {
  const userAgent =
    navigator.userAgent || (navigator as any).vendor || (window as any).opera;

  const isAndroid = /android/i.test(userAgent);
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

  if (isAndroid) {
    window.location.href = "whish://"; // More reliable on Android
    setTimeout(() => {
      window.open(
        "https://play.google.com/store/apps/details?id=money.whish.android",
        "_blank"
      );
    }, 2000);
  } else if (isIOS) {
    window.location.href = "whish://"; // Preferred for iOS
    setTimeout(() => {
      window.location.href =
        "https://apps.apple.com/lb/app/whish-money/id1284243483";
    }, 2000);
  } else {
    window.open("https://apps.whish.money", "_blank");
  }
}
