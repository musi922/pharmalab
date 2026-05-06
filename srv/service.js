import cds from '@sap/cds';

export default class MainService extends cds.ApplicationService {
  async init() {
    this.on('READ', 'Data', this.#onReadData);
    return super.init();
  }

  async #onReadData(req, next) {
    return next();
  }
}
