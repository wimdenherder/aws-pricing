import { InvocationSettings } from "./settings/invocation_settings";
import { RDSStorage } from "./models/rds_storage";
import { PriceDuration } from "./price_converter";
import { StorageVolumePrice } from "./models/_storage_volume_price";
import { StorageVolumePriceFlat } from "./models/storage_volume_price_flat";
import { Context } from "./context";

export class RDSStoragePrice {
    constructor(private readonly settings: InvocationSettings, private readonly storageType: RDSStorage,
         private readonly storageSize: number) {

    }

    get(duration: PriceDuration): number {
        let priceData = this.loadPriceData()

        return priceData.totalPrice(duration)
    }

    private loadPriceData(): StorageVolumePrice {
        // All RDS storage loads from single URL
        let url = '/pricing/1.0/rds/database-storage/index.json'
        
        let body = Context.ctxt().awsDataLoader.loadPath(url)

        let resp = JSON.parse(body)

        let prices = this.filterRDSStorage(resp.prices)

        if (prices.length == 0) {
            throw `Can not find price for RDS storage type ${this.storageTypeStr()}`
        }

        if (prices.length > 1) { 
            throw `Too many matches for RDS storage type ${this.storageTypeStr()}`
        }

        return new StorageVolumePriceFlat(prices[0], this.storageSize)
    }

    private filterRDSStorage(prices) {
        return prices.filter(price => {
            return price.attributes['aws:deploymentOption'] === 'Single-AZ' &&
                price.attributes['aws:rds:dbEngine'] === 'Any' &&
                price.attributes['aws:region'] === this.settings.get('region') &&
                price.attributes['aws:rds:volumetype'] === this.volumeTypeAttr()
                // && price.attributes['aws:productFamily'] === 'Database Storage' &&
        })
    }

    private volumeTypeAttr(): string {
        switch (this.storageType) {
            case RDSStorage.GP2: {
                return "General Purpose"
            }
            case RDSStorage.PIOPS: {
                return "Provisioned IOPS"
            }
            case RDSStorage.Magnetic: {
                return "Magnetic"
            }
            case RDSStorage.Aurora: {
                return "General Purpose-Aurora"
            }
        }
    }

    private storageTypeStr(): string {
        return RDSStorage[this.storageType]
    }
}
