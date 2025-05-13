import express from 'express';
import http from 'http';
import { Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import type { Request, Response } from 'express';

// Define a transport interface matching what the MCP SDK expects
export interface ServerTransport {
  onmessage?: (message: any) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  start(): Promise<void>;
  send(message: any): Promise<void>;
  close(): Promise<void>;
}

export class HttpServerTransport implements ServerTransport {
  onmessage?: (message: any) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;

  private app: express.Express;
  private server: HttpServer | null = null;
  private port: number;

  constructor(port: number) {
    this.port = port;
    this.app = express();
    this.app.use(express.json({ limit: '50mb' }));
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.post('/', (req: Request, res: Response) => {
          try {
            const message = req.body;
            if (this.onmessage) {
              // Process the message
              const processPromise = Promise.resolve().then(() => this.onmessage!(message));
              
              // Handle the result
              processPromise
                .then((response) => {
                  res.json(response);
                })
                .catch((error) => {
                  console.error('Error processing message:', error);
                  res.status(500).json({
                    error: {
                      message: error instanceof Error ? error.message : String(error),
                      stack: error instanceof Error ? error.stack : undefined,
                    }
                  });
                });
            } else {
              res.status(500).json({ error: 'Message handler not registered' });
            }
          } catch (error) {
            console.error('Error handling request:', error);
            res.status(500).json({
              error: {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              }
            });
          }
        });

        this.app.get('/health', (req: Request, res: Response) => {
          res.json({ status: 'ok' });
        });

        this.server = http.createServer(this.app);
        this.server.listen(this.port, () => {
          const address = this.server!.address() as AddressInfo;
          console.log(`HTTP transport server listening on port ${address.port}`);
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('HTTP server error:', error);
          if (this.onerror) {
            this.onerror(error);
          }
          reject(error);
        });
      } catch (error) {
        console.error('Error starting HTTP transport:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async send(message: any): Promise<void> {
    // Nothing to do - responses are sent directly in the endpoint handler
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('HTTP transport server closed');
          if (this.onclose) {
            this.onclose();
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
} 