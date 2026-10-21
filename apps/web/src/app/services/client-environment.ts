export interface ClientEnvironment {
  browserName: string;
  browserVersion: string;
  os: string;
}

export function readClientEnvironment(): ClientEnvironment {
  const userAgent = navigator.userAgent;

  return {
    browserName: browserName(userAgent),
    browserVersion: browserVersion(userAgent),
    os: operatingSystem(userAgent),
  };
}

function browserName(userAgent: string): string {
  if (/Edg\//.test(userAgent)) {
    return 'Edge';
  }
  if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) {
    return 'Chrome';
  }
  if (/Firefox\//.test(userAgent)) {
    return 'Firefox';
  }
  if (/Safari\//.test(userAgent)) {
    return 'Safari';
  }
  return 'Unknown';
}

function browserVersion(userAgent: string): string {
  const match = userAgent.match(/(?:Edg|Chrome|Firefox|Version)\/(\d+(?:\.\d+)?)/);
  return match?.[1] ?? '0';
}

function operatingSystem(userAgent: string): string {
  if (/Windows NT/i.test(userAgent)) {
    return 'Windows';
  }
  if (/Android/i.test(userAgent)) {
    return 'Android';
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'iOS';
  }
  if (/Mac OS X/i.test(userAgent)) {
    return 'macOS';
  }
  if (/Linux/i.test(userAgent)) {
    return 'Linux';
  }
  return 'Unknown';
}
