var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var packadic;
(function (packadic) {
    var plugins;
    (function (plugins) {
        var TestWidget = (function (_super) {
            __extends(TestWidget, _super);
            function TestWidget() {
                _super.call(this);
                this.version = '1.0.0';
                this.widgetEventPrefix = 'test.';
                this.options = { 'test': 'yes' };
            }
            TestWidget.prototype._create = function () {
                console.log('TestWidget create');
            };
            return TestWidget;
        })(plugins.Widget);
        plugins.TestWidget = TestWidget;
        plugins.Widget.register('testWidget', TestWidget);
    })(plugins = packadic.plugins || (packadic.plugins = {}));
})(packadic || (packadic = {}));
//# sourceMappingURL=testWidget.js.map