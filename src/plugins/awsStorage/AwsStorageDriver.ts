import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Metaplex } from '@/Metaplex';
import { StorageDriver, MetaplexFile } from '@/types';
import { SolAmount } from '@/utils';

export class AwsStorageDriver extends StorageDriver {
  protected client: S3Client;
  protected bucketName: string;

  constructor(metaplex: Metaplex, client: S3Client, bucketName: string) {
    super(metaplex);
    this.client = client;
    this.bucketName = bucketName;
  }

  public async getPrice(..._files: MetaplexFile[]): Promise<SolAmount> {
    return SolAmount.zero();
  }

  public async upload(file: MetaplexFile): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: file.uniqueName,
      Body: file.toBuffer(),
    });

    try {
      await this.client.send(command);

      return await this.getUrl(file.uniqueName);
    } catch (err) {
      // TODO: Custom errors.
      throw err;
    }
  }

  protected async getUrl(key: string) {
    const region = await this.client.config.region();
    const encodedKey = encodeURIComponent(key);

    return `https://s3.${region}.amazonaws.com/${this.bucketName}/${encodedKey}`;
  }
}