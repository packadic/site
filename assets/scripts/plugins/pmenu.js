var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var packadic;
(function (packadic) {
    var plugins;
    (function (plugins) {
        var PackadicMenuWidget = (function (_super) {
            __extends(PackadicMenuWidget, _super);
            function PackadicMenuWidget() {
                _super.call(this);
                this.version = '1.0.0';
                this.widgetEventPrefix = 'pmenu.';
                this.options = {};
            }
            PackadicMenuWidget.prototype._create = function () {
                console.log('PackadicMenuWidget create');
            };
            return PackadicMenuWidget;
        })(plugins.Widget);
        plugins.PackadicMenuWidget = PackadicMenuWidget;
        plugins.Widget.register('pmenu', PackadicMenuWidget);
    })(plugins = packadic.plugins || (packadic.plugins = {}));
})(packadic || (packadic = {}));
//# sourceMappingURL=pmenu.js.map