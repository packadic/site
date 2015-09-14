var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var packadic;
(function (packadic) {
    var plugins;
    (function (plugins) {
        var TestPlugin = (function (_super) {
            __extends(TestPlugin, _super);
            function TestPlugin() {
                _super.apply(this, arguments);
            }
            TestPlugin.prototype._create = function () {
                console.log('TestPlugin create');
            };
            return TestPlugin;
        })(plugins.Plugin);
        plugins.TestPlugin = TestPlugin;
        plugins.Plugin.register('testPlugin', TestPlugin);
    })(plugins = packadic.plugins || (packadic.plugins = {}));
})(packadic || (packadic = {}));
//# sourceMappingURL=testPlugin.js.map