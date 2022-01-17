"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MongooseTruck = void 0;

var Connection = _interopRequireWildcard(require("./modules/connection"));

var _connection2 = _interopRequireDefault(require("./connection.json"));

var Logs = _interopRequireWildcard(require("./utils/logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//const connectionProductionStr = 'mongodb://localhost:27017/production';
//const connectionTestStr = 'mongodb://localhost:27017/test';
class MongooseTruck {
  globalData = [];
  from = null;
  froms = [];
  to = null;
  ModelFrom = null;
  ModelTo = null;
  static connect = Connection.connect;

  constructor(source, destinations = []) {
    this.source = source;
    this.destinations = destinations;
  }

  async timeout(ms) {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, ms);
    });
  }

  static create(source, destinations) {
    return new MongooseTruck(source, destinations);
  }

  completeSingleLoadFrom(config) {
    this.from = config;
    if (!this.from?.concurrent) this.from.concurrent = 1000;
    if (!this.from?.query) this.from.query = {};
    if (!this.from?.select) this.from.select = undefined;
    if (!this.from?.skip) this.from.skip = 0;
    if (!this.from?.populate) this.from.populate = undefined;
    if (!this.from?.sort) this.from.sort = undefined;
    if (!this.from?.limit) this.from.limit = undefined;
    this.ModelFrom = this.source.model(config.model, config.schema);
    Logs.log('Data models is installed for source');
    return this;
  }

  completeMultipleLoadFrom(config) {
    this.froms = config; //Logs.log(this.froms[0]);

    this.recursiveMultipleLoadFrom(config[0]);
    Logs.log('Data models is installed for source');
    return this;
  }

  recursiveMultipleLoadFrom(config) {
    this.from = config;
    if (!this.from?.concurrent) this.from.concurrent = 1000;
    if (!this.from?.query) this.from.query = {};
    if (!this.from?.select) this.from.select = undefined;
    if (!this.from?.skip) this.from.skip = 0;
    if (!this.from?.populate) this.from.populate = undefined;
    if (!this.from?.sort) this.from.sort = undefined;
    if (!this.from?.limit) this.from.limit = undefined;
    this.ModelFrom = this.source.model(this.from?.model, this.from?.schema);
  }

  loadFrom(config) {
    if (typeof config === "object" && config?.length > 0) {
      this.completeMultipleLoadFrom(config);
    } else {
      this.froms = undefined;
      this.completeSingleLoadFrom(config);
    }

    return this;
  }

  emptyTo(config) {
    this.to = config;
    this.ModelTo = this.destinations.map(destination => {
      return destination.model(config.model, config.schema);
    });
    Logs.log('Data Models is installed for destinations');
    return this;
  }

  async start(config = {
    parse: false
  }) {
    if (this.from === null) {
      return Logs.log('No source found please use loadFrom() method first');
    }

    if (this.source === null) {
      return Logs.log('No destination found please use loadTo() method so moving on fetching the data');
    }

    if (typeof this.froms === "object" && this.froms.length > 0) {
      if (config?.parse) {
        return await this.runMultipleDbMethodology();
      } else {
        await this.runMultipleDbMethodology();
        this.globalData = [];
        return [];
      }
    } else {
      if (config?.parse) {
        return await this.runDbMethodology();
      } else {
        await this.runDbMethodology();
        this.globalData = [];
        return [];
      }
    }
  }

  async runMultipleDbMethodology() {
    await this.runDbMethodology(0);

    for (let i = 1; i < this.froms?.length; i++) {
      this.recursiveMultipleLoadFrom(this.froms[i]);
      await this.runDbMethodology(i); //Logs.log(this.froms?.length)
    }

    return this.globalData;
  }

  async runDbMethodology(page = 0) {
    const count = await this.ModelFrom.find(this.from?.query).skip(this.from?.skip).count();
    let pages = Math.ceil(count / this.from.concurrent);
    let remaining = this.from.limit % this.from.concurrent;
    this.globalData[page] = [];

    if (this.from?.limit) {
      if (this.from?.limit <= this.from?.concurrent) {
        pages = 1;
        this.from.concurrent = this.from.limit;
      } else {
        pages = Math.ceil(this.from?.limit / this.from?.concurrent);
      }
    }

    if (count === 0 || pages === 0) {
      return Logs.log('No data found in source');
    }

    for (let i = 0; i < pages; i++) {
      if (i === pages - 1 && remaining > 0) {
        this.from.concurrent = remaining;
      }

      let data = await this.ModelFrom.find(this.from?.query).populate(this.from?.populate).skip(this.from?.skip + i * this.from?.concurrent).sort(this.from?.sort).select(this.from?.select).limit(this.from?.concurrent).lean();

      if (data.length === 0) {
        break;
      }

      this.globalData[page] = this.globalData[page].concat(data);

      try {
        await Promise.all(this.ModelTo.map((ModelTo, index) => {
          return ModelTo.insertMany(data, {
            ordered: false
          }).then(res => {
            Logs.log(`One batch of ${res.length} data inserted into ${index + 1 + ") " + ModelTo?.modelName} destinations`);
          }).catch(err => {
            Logs.log("Skipped - One Duplicate Key");
          });
        }));
      } catch (err) {}
    }

    return this.globalData;
  }

}

exports.MongooseTruck = MongooseTruck;