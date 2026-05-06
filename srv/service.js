import cds from '@sap/cds';

export default class MainService extends cds.ApplicationService {
  async init() {
    this.on('READ', 'Products', this.#onReadProducts);
    return super.init();
  }

  async #onReadProducts(req, next) {
    return next();
  }
}
