var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/errors/version.js
var version;
var init_version = __esm({
  "node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/errors/version.js"() {
    version = "2.46.2";
  }
});

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/errors/base.js
function walk(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause !== void 0)
    return walk(err.cause, fn);
  return fn ? null : err;
}
var errorConfig, BaseError;
var init_base = __esm({
  "node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/errors/base.js"() {
    init_version();
    errorConfig = {
      getDocsUrl: ({ docsBaseUrl, docsPath = "", docsSlug }) => docsPath ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath}${docsSlug ? `#${docsSlug}` : ""}` : void 0,
      version: `viem@${version}`
    };
    BaseError = class _BaseError extends Error {
      constructor(shortMessage, args = {}) {
        const details = (() => {
          if (args.cause instanceof _BaseError)
            return args.cause.details;
          if (args.cause?.message)
            return args.cause.message;
          return args.details;
        })();
        const docsPath = (() => {
          if (args.cause instanceof _BaseError)
            return args.cause.docsPath || args.docsPath;
          return args.docsPath;
        })();
        const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath });
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsUrl ? [`Docs: ${docsUrl}`] : [],
          ...details ? [`Details: ${details}`] : [],
          ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
        ].join("\n");
        super(message, args.cause ? { cause: args.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BaseError"
        });
        this.details = details;
        this.docsPath = docsPath;
        this.metaMessages = args.metaMessages;
        this.name = args.name ?? this.name;
        this.shortMessage = shortMessage;
        this.version = version;
      }
      walk(fn) {
        return walk(this, fn);
      }
    };
  }
});

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/constants/unit.js
var etherUnits;
var init_unit = __esm({
  "node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/constants/unit.js"() {
    etherUnits = {
      gwei: 9,
      wei: 18
    };
  }
});

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/utils/chain/defineChain.js
function defineChain(chain) {
  const chainInstance = {
    formatters: void 0,
    fees: void 0,
    serializers: void 0,
    ...chain
  };
  function extend(base) {
    return (fnOrExtended) => {
      const properties = typeof fnOrExtended === "function" ? fnOrExtended(base) : fnOrExtended;
      const combined = { ...base, ...properties };
      return Object.assign(combined, { extend: extend(combined) });
    };
  }
  return Object.assign(chainInstance, {
    extend: extend(chainInstance)
  });
}

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/utils/unit/parseEther.js
init_unit();

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/errors/unit.js
init_base();
var InvalidDecimalNumberError = class extends BaseError {
  constructor({ value }) {
    super(`Number \`${value}\` is not a valid decimal number.`, {
      name: "InvalidDecimalNumberError"
    });
  }
};

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/utils/unit/parseUnits.js
function parseUnits(value, decimals) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
    throw new InvalidDecimalNumberError({ value });
  let [integer, fraction = "0"] = value.split(".");
  const negative = integer.startsWith("-");
  if (negative)
    integer = integer.slice(1);
  fraction = fraction.replace(/(0+)$/, "");
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`;
    fraction = "";
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals)
    ];
    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    else
      fraction = `${left}${rounded}`;
    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }
    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }
  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}

// node_modules/.pnpm/viem@2.46.2_typescript@5.9.3/node_modules/viem/_esm/utils/unit/parseEther.js
function parseEther(ether, unit = "wei") {
  return parseUnits(ether, etherUnits[unit]);
}

// node_modules/.pnpm/@plumise+core@0.1.1_viem@2.46.2_typescript@5.9.3_/node_modules/@plumise/core/dist/index.js
var plumise = defineChain({
  id: 41956,
  name: "Plumise",
  nativeCurrency: {
    decimals: 18,
    name: "PLM",
    symbol: "PLM"
  },
  rpcUrls: {
    default: {
      http: ["https://node-1.plumise.com/rpc"],
      webSocket: ["wss://node-1.plumise.com/ws"]
    }
  },
  blockExplorers: {
    default: { name: "Plumscan", url: "https://scan.plumise.com" }
  }
});
var plumiseTestnet = defineChain({
  id: 419561,
  name: "Plumise Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "PLM",
    symbol: "PLM"
  },
  rpcUrls: {
    default: {
      http: ["https://node-1.plumise.com/testnet/rpc"],
      webSocket: ["wss://node-1.plumise.com/testnet/ws"]
    }
  },
  blockExplorers: {
    default: { name: "Plumscan Testnet", url: "https://testnet-explorer.plumise.com" }
  },
  testnet: true
});
function parsePLM(plm) {
  return parseEther(plm);
}
var COST_PER_1000_TOKENS = parseEther("0.001");
var PRO_TIER_MINIMUM = parseEther("100");

// packages/core/src/constants.ts
var PLUMISE_CHAIN = {
  chainId: plumise.id,
  chainIdHex: `0x${plumise.id.toString(16)}`,
  name: plumise.name,
  rpcUrl: plumise.rpcUrls.default.http[0],
  explorerUrl: plumise.blockExplorers.default.url,
  symbol: plumise.nativeCurrency.symbol,
  decimals: plumise.nativeCurrency.decimals
};
var PEXUS_CHROME_STORE_URL = "https://chromewebstore.google.com/detail/pexus/...";
var ERC20_TRANSFER_ABI = "function transfer(address to, uint256 amount) returns (bool)";
var DEFAULT_CONFIG = {
  theme: "auto",
  locale: "ko",
  chainId: PLUMISE_CHAIN.chainId,
  rpcUrl: PLUMISE_CHAIN.rpcUrl,
  chainName: PLUMISE_CHAIN.name,
  explorerUrl: PLUMISE_CHAIN.explorerUrl
};
var PAYMENT_TIMEOUT_MS = 15 * 60 * 1e3;
var TX_POLL_INTERVAL_MS = 3e3;

// packages/core/src/wallet.ts
function getProvider() {
  if (typeof window === "undefined") return null;
  const w = window;
  if (w.pexus?.ethereum) return w.pexus.ethereum;
  if (w.plumise?.ethereum) return w.plumise.ethereum;
  if (w.ethereum?.isPexus) return w.ethereum;
  return w.ethereum ?? null;
}
function detectWallet() {
  if (typeof window === "undefined") return { type: "none" };
  const w = window;
  if (w.pexus?.ethereum || w.plumise?.ethereum) {
    return { type: "pexus" };
  }
  const provider = w.ethereum;
  if (!provider) return { type: "none" };
  if (provider.isPexus) return { type: "pexus" };
  if (provider.isMetaMask) return { type: "metamask" };
  return { type: "other" };
}
async function connectWallet() {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet provider found");
  const accounts = await provider.request({
    method: "eth_requestAccounts"
  });
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned");
  }
  return accounts[0];
}
async function getChainId() {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet provider found");
  const chainIdHex = await provider.request({ method: "eth_chainId" });
  return parseInt(chainIdHex, 16);
}
async function switchToPlumise(chain) {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet provider found");
  const chainId = chain?.chainId ?? PLUMISE_CHAIN.chainId;
  const chainIdHex = `0x${chainId.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  } catch (err) {
    const error = err;
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: chain?.name ?? PLUMISE_CHAIN.name,
            rpcUrls: [chain?.rpcUrl ?? PLUMISE_CHAIN.rpcUrl],
            blockExplorerUrls: [chain?.explorerUrl ?? PLUMISE_CHAIN.explorerUrl],
            nativeCurrency: {
              name: chain?.symbol ?? PLUMISE_CHAIN.symbol,
              symbol: chain?.symbol ?? PLUMISE_CHAIN.symbol,
              decimals: chain?.decimals ?? PLUMISE_CHAIN.decimals
            }
          }
        ]
      });
    } else {
      throw err;
    }
  }
}
function toHexWei(amount) {
  const wei = parsePLM(amount);
  return `0x${wei.toString(16)}`;
}
function encodeERC20Transfer(to, amountWei) {
  const selector = "0xa9059cbb";
  const paddedTo = to.replace("0x", "").padStart(64, "0");
  const paddedAmount = amountWei.toString(16).padStart(64, "0");
  return `${selector}${paddedTo}${paddedAmount}`;
}
async function sendTransaction(to, amount, from, data) {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet provider found");
  const txHash = await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to,
        value: toHexWei(amount),
        ...data ? { data } : {}
      }
    ]
  });
  return txHash;
}
async function sendERC20(tokenAddress, to, amount, from) {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet provider found");
  const amountWei = parsePLM(amount);
  const data = encodeERC20Transfer(to, amountWei);
  const txHash = await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: tokenAddress,
        value: "0x0",
        data
      }
    ]
  });
  return txHash;
}
async function waitForConfirmation(txHash, rpcUrl, timeout = 6e4) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getTransactionReceipt",
          params: [txHash]
        })
      });
      const json = await res.json();
      if (json.result) {
        if (json.result.status === "0x0") {
          throw new Error("Transaction reverted");
        }
        return { blockNumber: parseInt(json.result.blockNumber, 16) };
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Transaction reverted") {
        throw err;
      }
    }
    await sleep(TX_POLL_INTERVAL_MS);
  }
  throw new Error("Confirmation timeout");
}
async function pollForPayment(to, expectedAmountWei, rpcUrl, onDetected, signal) {
  const normalizedTo = to.toLowerCase();
  let lastBlock = await getLatestBlockNumber(rpcUrl);
  return new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")));
    const poll = async () => {
      if (signal.aborted) return;
      try {
        const current = await getLatestBlockNumber(rpcUrl);
        if (current > lastBlock) {
          for (let i = lastBlock + 1; i <= current; i++) {
            const txHash = await checkBlockForPayment(i, normalizedTo, expectedAmountWei, rpcUrl);
            if (txHash) {
              onDetected(txHash);
              resolve(txHash);
              return;
            }
          }
          lastBlock = current;
        }
      } catch {
      }
      if (!signal.aborted) {
        setTimeout(poll, 5e3);
      }
    };
    poll();
  });
}
async function getLatestBlockNumber(rpcUrl) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_blockNumber",
      params: []
    })
  });
  const json = await res.json();
  return parseInt(json.result, 16);
}
async function checkBlockForPayment(blockNumber, to, expectedAmountWei, rpcUrl) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBlockByNumber",
      params: [`0x${blockNumber.toString(16)}`, true]
    })
  });
  const json = await res.json();
  if (!json.result) return null;
  for (const tx of json.result.transactions) {
    if (tx.to?.toLowerCase() === to && BigInt(tx.value) >= expectedAmountWei) {
      return tx.hash;
    }
  }
  return null;
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// packages/core/src/i18n.ts
var messages = {
  ko: {
    pay_with: "{wallet}(\uC73C)\uB85C \uACB0\uC81C",
    install_pexus: "Pexus \uC124\uCE58\uD558\uAE30",
    install_pexus_desc: "\uCD94\uCC9C \xB7 \uC6D0\uD074\uB9AD \uACB0\uC81C",
    other_wallet: "\uB2E4\uB978 \uC9C0\uAC11\uC73C\uB85C \uACB0\uC81C",
    manual_transfer: "\uC9C1\uC811 \uC804\uC1A1\uD558\uAE30",
    processing: "\uCC98\uB9AC \uC911...",
    confirmed: "\uACB0\uC81C \uC644\uB8CC",
    cancelled: "\uACB0\uC81C \uCDE8\uC18C\uB428",
    expired: "\uACB0\uC81C \uB9CC\uB8CC\uB428",
    error: "\uACB0\uC81C \uC2E4\uD328",
    copy_address: "\uC8FC\uC18C \uBCF5\uC0AC",
    copied: "\uBCF5\uC0AC\uB428",
    amount: "\uAE08\uC561",
    recipient: "\uBC1B\uB294 \uC8FC\uC18C",
    network: "\uB124\uD2B8\uC6CC\uD06C",
    waiting: "\uC785\uAE08 \uB300\uAE30 \uC911...",
    expires_in: "{time} \uB0A8\uC74C",
    powered_by: "Powered by Plumise",
    close: "\uB2EB\uAE30",
    retry: "\uB2E4\uC2DC \uC2DC\uB3C4",
    view_tx: "\uD2B8\uB79C\uC7AD\uC158 \uBCF4\uAE30",
    switch_network: "\uB124\uD2B8\uC6CC\uD06C \uC804\uD658",
    switch_network_desc: "Plumise \uB124\uD2B8\uC6CC\uD06C\uB85C \uC804\uD658\uD569\uB2C8\uB2E4",
    connect_wallet: "\uC9C0\uAC11 \uC5F0\uACB0"
  },
  en: {
    pay_with: "Pay with {wallet}",
    install_pexus: "Install Pexus",
    install_pexus_desc: "Recommended \xB7 One-click payment",
    other_wallet: "Pay with other wallet",
    manual_transfer: "Transfer manually",
    processing: "Processing...",
    confirmed: "Payment Complete",
    cancelled: "Payment Cancelled",
    expired: "Payment Expired",
    error: "Payment Failed",
    copy_address: "Copy address",
    copied: "Copied",
    amount: "Amount",
    recipient: "Recipient",
    network: "Network",
    waiting: "Waiting for payment...",
    expires_in: "{time} remaining",
    powered_by: "Powered by Plumise",
    close: "Close",
    retry: "Retry",
    view_tx: "View Transaction",
    switch_network: "Switch Network",
    switch_network_desc: "Switching to Plumise network",
    connect_wallet: "Connect Wallet"
  }
};
function t(locale, key, vars) {
  let msg = messages[locale]?.[key] ?? messages["en"][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, v);
    }
  }
  return msg;
}

// packages/core/src/modal.ts
var host = null;
var shadow = null;
var currentLocale = "ko";
var currentTheme = "auto";
var handlers = {};
var expiryTimer = null;
var STYLES = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    box-sizing: border-box;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes checkIn {
    0% { stroke-dashoffset: 100; }
    100% { stroke-dashoffset: 0; }
  }

  .modal {
    width: 100%;
    max-width: 420px;
    border-radius: 20px;
    overflow: hidden;
    animation: slideUp 0.25s ease;
    position: relative;
  }

  .light .modal {
    background: #ffffff;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    color: #111827;
  }

  .dark .modal {
    background: #1a1a2e;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    color: #f1f5f9;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 0;
  }

  .modal-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 13px;
  }

  .logo-text {
    font-weight: 700;
    font-size: 15px;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: background 0.15s;
    padding: 0;
  }

  .light .close-btn {
    color: #6b7280;
  }
  .light .close-btn:hover { background: #f3f4f6; }

  .dark .close-btn {
    color: #9ca3af;
  }
  .dark .close-btn:hover { background: rgba(255,255,255,0.08); }

  .modal-body {
    padding: 20px;
  }

  .payment-info {
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .light .payment-info {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .dark .payment-info {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .info-row:last-child { margin-bottom: 0; }

  .info-label {
    font-weight: 500;
    opacity: 0.6;
  }

  .info-value {
    font-weight: 600;
    text-align: right;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .amount-value {
    font-size: 15px;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .desc-text {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    opacity: 0.85;
  }

  .btn {
    width: 100%;
    padding: 14px 16px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
    position: relative;
  }

  .btn:last-child { margin-bottom: 0; }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    color: white;
  }

  .btn-primary:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(124,58,237,0.35);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .light .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .light .btn-secondary:hover { background: #e5e7eb; }

  .dark .btn-secondary {
    background: rgba(255,255,255,0.06);
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .dark .btn-secondary:hover { background: rgba(255,255,255,0.1); }

  .btn-tag {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255,255,255,0.2);
    font-weight: 500;
    margin-left: auto;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 0;
    font-size: 12px;
    opacity: 0.5;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
  }

  .light .divider::before,
  .light .divider::after { background: #e5e7eb; }

  .dark .divider::before,
  .dark .divider::after { background: rgba(255,255,255,0.1); }

  .address-box {
    border-radius: 10px;
    padding: 12px 14px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    word-break: break-all;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .light .address-box {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .dark .address-box {
    background: rgba(255,255,255,0.05);
    color: #d1d5db;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .address-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-btn {
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .light .copy-btn {
    color: #7c3aed;
    background: rgba(124,58,237,0.08);
  }

  .light .copy-btn:hover { background: rgba(124,58,237,0.15); }

  .dark .copy-btn {
    color: #a78bfa;
    background: rgba(124,58,237,0.15);
  }

  .dark .copy-btn:hover { background: rgba(124,58,237,0.25); }

  .status-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    gap: 16px;
    text-align: center;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(124,58,237,0.2);
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .status-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .icon-success { background: rgba(16,185,129,0.1); }
  .icon-error { background: rgba(239,68,68,0.1); }
  .icon-cancel { background: rgba(107,114,128,0.1); }
  .icon-expired { background: rgba(245,158,11,0.1); }

  .status-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  .status-sub {
    font-size: 13px;
    opacity: 0.6;
    margin: 0;
    max-width: 300px;
  }

  .tx-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    color: #7c3aed;
    padding: 8px 16px;
    border-radius: 8px;
    background: rgba(124,58,237,0.08);
    transition: background 0.15s;
  }

  .tx-link:hover { background: rgba(124,58,237,0.15); }

  .expire-timer {
    font-size: 13px;
    opacity: 0.6;
    text-align: center;
    margin-top: 8px;
  }

  .expire-timer span {
    font-weight: 600;
    color: #f59e0b;
  }

  .waiting-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    opacity: 0.7;
    margin-top: 4px;
  }

  .waiting-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7c3aed;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .modal-footer {
    padding: 12px 20px 16px;
    text-align: center;
    font-size: 11px;
  }

  .light .modal-footer { color: #9ca3af; }
  .dark .modal-footer { color: #6b7280; }

  .powered-link {
    text-decoration: none;
    font-weight: 500;
  }

  .light .powered-link { color: #7c3aed; }
  .dark .powered-link { color: #a78bfa; }
`;
function getThemeClass(theme) {
  if (theme === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}
function buildInfoRow(label, value, valueClass = "") {
  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value ${valueClass}">${value}</span>
    </div>
  `;
}
function buildPaymentInfoBlock(request) {
  const locale = currentLocale;
  const rows = [];
  if (request.description) {
    rows.push(buildInfoRow("", `<span class="desc-text">${request.description}</span>`));
  }
  rows.push(buildInfoRow(t(locale, "amount"), `${request.amount} PLM`, "amount-value"));
  rows.push(
    buildInfoRow(
      t(locale, "recipient"),
      `${request.to.slice(0, 6)}...${request.to.slice(-4)}`
    )
  );
  rows.push(buildInfoRow(t(locale, "network"), PLUMISE_CHAIN.name));
  return `<div class="payment-info">${rows.join("")}</div>`;
}
function renderWalletAvailable(request, walletInfo) {
  const locale = currentLocale;
  const walletName = walletInfo.type === "pexus" ? "Pexus" : walletInfo.type === "metamask" ? "MetaMask" : "Wallet";
  return `
    ${buildPaymentInfoBlock(request)}
    <button class="btn btn-primary" id="pay-wallet-btn">
      ${walletName === "Pexus" ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="white" fill-opacity="0.3"/><path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ""}
      ${t(locale, "pay_with", { wallet: walletName })}
    </button>
    <div class="divider">\uB610\uB294</div>
    <button class="btn btn-secondary" id="manual-btn">
      ${t(locale, "manual_transfer")}
    </button>
  `;
}
function renderNoWallet(request) {
  const locale = currentLocale;
  return `
    ${buildPaymentInfoBlock(request)}
    <button class="btn btn-primary" id="install-pexus-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L12 16M12 16L8 12M12 16L16 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20H20" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
      ${t(locale, "install_pexus")}
      <span class="btn-tag">${t(locale, "install_pexus_desc")}</span>
    </button>
    <button class="btn btn-secondary" id="other-wallet-btn">
      ${t(locale, "other_wallet")}
    </button>
    <button class="btn btn-secondary" id="manual-btn">
      ${t(locale, "manual_transfer")}
    </button>
  `;
}
function renderManualTransfer(request, expiresAt) {
  const locale = currentLocale;
  const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1e3));
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  return `
    ${buildPaymentInfoBlock(request)}
    <div style="margin-bottom:8px;font-size:13px;font-weight:600;opacity:0.7;">${t(locale, "recipient")}</div>
    <div class="address-box">
      <span class="address-text">${request.to}</span>
      <button class="copy-btn" id="copy-addr-btn">${t(locale, "copy_address")}</button>
    </div>
    <div style="margin-top:8px;margin-bottom:4px;font-size:13px;font-weight:600;opacity:0.7;">${t(locale, "amount")}</div>
    <div class="address-box" style="font-size:16px;font-weight:700;">
      <span>${request.amount} PLM</span>
      <button class="copy-btn" id="copy-amount-btn">${t(locale, "copy_address")}</button>
    </div>
    <div class="waiting-status">
      <div class="waiting-dot"></div>
      <span>${t(locale, "waiting")}</span>
    </div>
    <div class="expire-timer" id="expire-timer">
      ${t(locale, "expires_in", { time: `<span>${timeStr}</span>` })}
    </div>
  `;
}
function renderProcessing(txHash) {
  const locale = currentLocale;
  return `
    <div class="status-center">
      <div class="spinner"></div>
      <p class="status-title">${t(locale, "processing")}</p>
      ${txHash ? `<a class="tx-link" href="${PLUMISE_CHAIN.explorerUrl}/tx/${txHash}" target="_blank" rel="noopener">${t(locale, "view_tx")} \u2197</a>` : ""}
    </div>
  `;
}
function renderConfirmed(txHash, blockNumber) {
  const locale = currentLocale;
  return `
    <div class="status-center">
      <div class="status-icon icon-success">\u2705</div>
      <p class="status-title">${t(locale, "confirmed")}</p>
      ${blockNumber ? `<p class="status-sub">Block #${blockNumber}</p>` : ""}
      ${txHash ? `<a class="tx-link" href="${PLUMISE_CHAIN.explorerUrl}/tx/${txHash}" target="_blank" rel="noopener">${t(locale, "view_tx")} \u2197</a>` : ""}
    </div>
  `;
}
function renderCancelled() {
  const locale = currentLocale;
  return `
    <div class="status-center">
      <div class="status-icon icon-cancel">\u2715</div>
      <p class="status-title">${t(locale, "cancelled")}</p>
      <button class="btn btn-secondary" id="close-final-btn" style="margin-top:8px;max-width:200px;">
        ${t(locale, "close")}
      </button>
    </div>
  `;
}
function renderExpired() {
  const locale = currentLocale;
  return `
    <div class="status-center">
      <div class="status-icon icon-expired">\u23F1</div>
      <p class="status-title">${t(locale, "expired")}</p>
      <button class="btn btn-secondary" id="close-final-btn" style="margin-top:8px;max-width:200px;">
        ${t(locale, "close")}
      </button>
    </div>
  `;
}
function renderError(message) {
  const locale = currentLocale;
  return `
    <div class="status-center">
      <div class="status-icon icon-error">\u26A0</div>
      <p class="status-title">${t(locale, "error")}</p>
      ${message ? `<p class="status-sub">${message}</p>` : ""}
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-secondary" id="retry-btn" style="max-width:120px;">${t(locale, "retry")}</button>
        <button class="btn btn-secondary" id="close-final-btn" style="max-width:120px;">${t(locale, "close")}</button>
      </div>
    </div>
  `;
}
function getThemeWrapper() {
  return shadow?.querySelector(".theme-wrapper") ?? null;
}
function getModalBody() {
  return shadow?.querySelector(".modal-body") ?? null;
}
function attachBodyListeners(request) {
  const body = getModalBody();
  if (!body) return;
  body.querySelector("#pay-wallet-btn")?.addEventListener("click", () => handlers.onPayWithWallet?.());
  body.querySelector("#install-pexus-btn")?.addEventListener("click", () => handlers.onInstallPexus?.());
  body.querySelector("#other-wallet-btn")?.addEventListener("click", () => handlers.onOtherWallet?.());
  body.querySelector("#manual-btn")?.addEventListener("click", () => handlers.onManualTransfer?.());
  body.querySelector("#close-final-btn")?.addEventListener("click", () => handlers.onClose?.());
  body.querySelector("#retry-btn")?.addEventListener("click", () => handlers.onRetry?.());
  const copyAddrBtn = body.querySelector("#copy-addr-btn");
  if (copyAddrBtn) {
    copyAddrBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(request.to).then(() => {
        copyAddrBtn.textContent = t(currentLocale, "copied");
        setTimeout(() => {
          copyAddrBtn.textContent = t(currentLocale, "copy_address");
        }, 2e3);
      });
    });
  }
  const copyAmountBtn = body.querySelector("#copy-amount-btn");
  if (copyAmountBtn) {
    copyAmountBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(request.amount).then(() => {
        copyAmountBtn.textContent = t(currentLocale, "copied");
        setTimeout(() => {
          copyAmountBtn.textContent = t(currentLocale, "copy_address");
        }, 2e3);
      });
    });
  }
}
function startExpiryTimer(expiresAt) {
  if (expiryTimer) clearInterval(expiryTimer);
  expiryTimer = setInterval(() => {
    const timerEl = shadow?.querySelector("#expire-timer");
    if (!timerEl) {
      if (expiryTimer) clearInterval(expiryTimer);
      return;
    }
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1e3));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
    timerEl.innerHTML = t(currentLocale, "expires_in", {
      time: `<span>${timeStr}</span>`
    });
  }, 1e3);
}
function createModal(config) {
  if (host) return;
  currentLocale = config.locale;
  currentTheme = config.theme;
  host = document.createElement("div");
  host.id = "__plumise-pay-modal__";
  shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = STYLES;
  shadow.appendChild(style);
  document.body.appendChild(host);
}
function showModal(request, walletInfo, hdlrs) {
  if (!shadow) return;
  handlers = hdlrs;
  const themeClass = getThemeClass(currentTheme);
  const locale = currentLocale;
  const existingWrapper = shadow.querySelector(".theme-wrapper");
  if (existingWrapper) existingWrapper.remove();
  const wrapper = document.createElement("div");
  wrapper.className = `theme-wrapper ${themeClass}`;
  wrapper.innerHTML = `
    <div class="overlay" id="overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Plumise Payment">
        <div class="modal-header">
          <div class="modal-logo">
            <div class="logo-icon">P</div>
            <span class="logo-text">Plumise Pay</span>
          </div>
          <button class="close-btn" id="modal-close-btn" aria-label="${t(locale, "close")}">\u2715</button>
        </div>
        <div class="modal-body">
          ${walletInfo.type !== "none" ? renderWalletAvailable(request, walletInfo) : renderNoWallet(request)}
        </div>
        <div class="modal-footer">
          <a class="powered-link" href="${PLUMISE_CHAIN.explorerUrl}" target="_blank" rel="noopener">
            ${t(locale, "powered_by")}
          </a>
        </div>
      </div>
    </div>
  `;
  shadow.appendChild(wrapper);
  wrapper.querySelector("#modal-close-btn")?.addEventListener("click", () => handlers.onClose?.());
  wrapper.querySelector("#overlay")?.addEventListener("click", (e) => {
    if (e.target === wrapper.querySelector("#overlay")) handlers.onClose?.();
  });
  attachBodyListeners(request);
}
function showManualTransfer(request, expiresAt) {
  const body = getModalBody();
  if (!body) return;
  body.innerHTML = renderManualTransfer(request, expiresAt);
  attachBodyListeners(request);
  startExpiryTimer(expiresAt);
}
function updateStatus(status, extra) {
  const body = getModalBody();
  if (!body) return;
  if (expiryTimer && status !== "pending") {
    clearInterval(expiryTimer);
    expiryTimer = null;
  }
  switch (status) {
    case "connecting":
    case "awaiting_approval":
    case "pending":
      body.innerHTML = renderProcessing(extra?.txHash);
      break;
    case "confirmed":
      body.innerHTML = renderConfirmed(extra?.txHash, extra?.blockNumber);
      break;
    case "cancelled":
      body.innerHTML = renderCancelled();
      body.querySelector("#close-final-btn")?.addEventListener("click", () => handlers.onClose?.());
      break;
    case "expired":
      body.innerHTML = renderExpired();
      body.querySelector("#close-final-btn")?.addEventListener("click", () => handlers.onClose?.());
      break;
    case "error":
      body.innerHTML = renderError(extra?.error);
      body.querySelector("#close-final-btn")?.addEventListener("click", () => handlers.onClose?.());
      body.querySelector("#retry-btn")?.addEventListener("click", () => handlers.onRetry?.());
      break;
  }
}
function hideModal() {
  if (expiryTimer) {
    clearInterval(expiryTimer);
    expiryTimer = null;
  }
  const wrapper = getThemeWrapper();
  if (wrapper) {
    wrapper.style.opacity = "0";
    wrapper.style.transition = "opacity 0.2s ease";
    setTimeout(() => {
      wrapper.remove();
    }, 200);
  }
}
function destroyModal() {
  hideModal();
  if (host) {
    host.remove();
    host = null;
    shadow = null;
  }
}

// packages/core/src/plumise-pay.ts
var PlumisePay = class {
  constructor(config) {
    this.abortController = null;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
  emit(event, data) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }
  setStatus(status, extra) {
    this.emit("status_change", { status, ...extra });
    updateStatus(status, extra);
  }
  async getWallet() {
    const info = detectWallet();
    if (info.type !== "none") {
      try {
        const chainId = await getChainId();
        return { ...info, chainId };
      } catch {
        return info;
      }
    }
    return info;
  }
  async requestPayment(request) {
    this.abortController = new AbortController();
    const walletInfo = detectWallet();
    this.emit("wallet_detected", walletInfo);
    createModal({
      theme: this.config.theme,
      locale: this.config.locale
    });
    return new Promise((resolve) => {
      const finish = (result) => {
        setTimeout(() => hideModal(), result.status === "confirmed" ? 2e3 : 0);
        resolve(result);
      };
      const handleClose = () => {
        this.abortController?.abort();
        hideModal();
        resolve({ status: "cancelled" });
      };
      const handleRetry = () => {
        showModal(request, walletInfo, {
          onPayWithWallet: handlePayWithWallet,
          onInstallPexus: handleInstallPexus,
          onOtherWallet: handleOtherWallet,
          onManualTransfer: handleManualTransfer,
          onClose: handleClose,
          onRetry: handleRetry
        });
      };
      const handleInstallPexus = () => {
        window.open(PEXUS_CHROME_STORE_URL, "_blank", "noopener");
      };
      const handleOtherWallet = () => {
        handlePayWithWallet();
      };
      const handleManualTransfer = () => {
        const expiresAt = Date.now() + PAYMENT_TIMEOUT_MS;
        showManualTransfer(request, expiresAt);
        const expectedWei = parsePLM(request.amount);
        pollForPayment(
          request.to,
          expectedWei,
          this.config.rpcUrl,
          (txHash) => {
            this.emit("tx_submitted", { txHash });
            this.setStatus("pending", { txHash });
          },
          this.abortController.signal
        ).then(async (txHash) => {
          const result = await waitForConfirmation(txHash, this.config.rpcUrl);
          this.emit("tx_confirmed", { txHash, ...result });
          this.setStatus("confirmed", { txHash, blockNumber: result.blockNumber });
          finish({ status: "confirmed", txHash, blockNumber: result.blockNumber });
        }).catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg === "aborted") {
            return;
          }
          this.setStatus("expired");
          finish({ status: "expired" });
        });
        setTimeout(() => {
          if (!this.abortController?.signal.aborted) {
            this.abortController?.abort();
            this.setStatus("expired");
            finish({ status: "expired" });
          }
        }, PAYMENT_TIMEOUT_MS);
      };
      const handlePayWithWallet = async () => {
        try {
          this.setStatus("connecting");
          const address = await connectWallet();
          const currentChainId = await getChainId();
          if (currentChainId !== this.config.chainId) {
            await switchToPlumise({
              chainId: this.config.chainId,
              name: this.config.chainName,
              rpcUrl: this.config.rpcUrl,
              explorerUrl: this.config.explorerUrl
            });
          }
          this.setStatus("awaiting_approval");
          let txHash;
          if (!request.token || request.token === "native") {
            txHash = await sendTransaction(request.to, request.amount, address);
          } else {
            txHash = await sendERC20(request.token, request.to, request.amount, address);
          }
          this.emit("tx_submitted", { txHash });
          this.setStatus("pending", { txHash });
          const receipt = await waitForConfirmation(txHash, this.config.rpcUrl, 12e4);
          this.emit("tx_confirmed", { txHash, ...receipt });
          this.setStatus("confirmed", { txHash, blockNumber: receipt.blockNumber });
          finish({ status: "confirmed", txHash, blockNumber: receipt.blockNumber });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const isUserReject = msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("denied") || err.code === 4001;
          if (isUserReject) {
            this.setStatus("cancelled");
            finish({ status: "cancelled" });
          } else {
            this.emit("error", { error: msg });
            this.setStatus("error", { error: msg });
          }
        }
      };
      showModal(request, walletInfo, {
        onPayWithWallet: handlePayWithWallet,
        onInstallPexus: handleInstallPexus,
        onOtherWallet: handleOtherWallet,
        onManualTransfer: handleManualTransfer,
        onClose: handleClose,
        onRetry: handleRetry
      });
    });
  }
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }
  destroy() {
    this.abortController?.abort();
    destroyModal();
    this.listeners.clear();
  }
};
export {
  DEFAULT_CONFIG,
  ERC20_TRANSFER_ABI,
  PAYMENT_TIMEOUT_MS,
  PEXUS_CHROME_STORE_URL,
  PLUMISE_CHAIN,
  PlumisePay,
  TX_POLL_INTERVAL_MS,
  connectWallet,
  detectWallet,
  getChainId,
  switchToPlumise,
  t
};
