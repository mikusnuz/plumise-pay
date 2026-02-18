import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RpcService {
  private readonly logger = new Logger(RpcService.name);
  private readonly rpcUrl: string;
  readonly wsUrl: string;
  private requestId = 0;

  constructor() {
    this.rpcUrl = process.env.RPC_URL || 'http://localhost:26902';
    this.wsUrl = process.env.WS_URL || 'ws://localhost:26912';
  }

  private async call(method: string, params: any[] = []): Promise<any> {
    const id = ++this.requestId;
    const res = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    });

    const json = await res.json();
    if (json.error) {
      this.logger.error(`RPC error ${method}: ${JSON.stringify(json.error)}`);
      return null;
    }
    return json.result;
  }

  async getTransactionReceipt(
    txHash: string,
  ): Promise<{ status: string; blockNumber: string } | null> {
    return this.call('eth_getTransactionReceipt', [txHash]);
  }

  async getBlockNumber(): Promise<number> {
    const hex = await this.call('eth_blockNumber');
    return hex ? parseInt(hex, 16) : 0;
  }

  async getTransaction(
    txHash: string,
  ): Promise<{ from: string; to: string; value: string } | null> {
    return this.call('eth_getTransactionByHash', [txHash]);
  }
}
