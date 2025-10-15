declare module "html5-qrcode" {
  export interface Html5QrcodeScannerConfig {
    fps?: number;
    qrbox?: { width: number; height: number } | number;
    aspectRatio?: number;
    disableFlip?: boolean;
    rememberLastUsedCamera?: boolean;
    supportedScanTypes?: number[];
    showTorchButtonIfSupported?: boolean;
    showZoomSliderIfSupported?: boolean;
  }

  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: Html5QrcodeScannerConfig,
      verbose?: boolean
    );

    render(
      onScanSuccess: (decodedText: string, decodedResult?: any) => void,
      onScanFailure?: (error: string) => void
    ): void;

    clear(): Promise<void>;
  }

  export class Html5Qrcode {
    constructor(elementId: string, verbose?: boolean);

    start(
      cameraIdOrConfig: string | { facingMode: string },
      config: {
        fps?: number;
        qrbox?: { width: number; height: number } | number;
        aspectRatio?: number;
        disableFlip?: boolean;
      },
      onScanSuccess: (decodedText: string, decodedResult?: any) => void,
      onScanFailure?: (error: string) => void
    ): Promise<void>;

    stop(): Promise<void>;
    clear(): Promise<void>;
  }
}
