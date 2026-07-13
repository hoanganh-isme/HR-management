window.BaseRepository = function (listName, options) {
  this.listName = listName;
  this.options = options || {};
};
BaseRepository.prototype.view = function (options) { return GatewayClient.view(this.listName, Object.assign({}, this.options, options)); };
BaseRepository.prototype.save = function (data, options) { return GatewayClient.save(this.listName, data, Object.assign({}, this.options, options)); };
BaseRepository.prototype.delete = function (ids, options) { return GatewayClient.delete(this.listName, ids, Object.assign({}, this.options, options)); };
BaseRepository.prototype.execute = function (data, options) { return GatewayClient.execute(this.listName, data, Object.assign({}, this.options, options)); };

