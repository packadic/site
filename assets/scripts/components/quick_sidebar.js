var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var packadic;
(function (packadic) {
    var layout;
    (function (layout) {
        var Component = packadic.components.Component;
        var Components = packadic.components.Components;
        var defaultConfig = {
            transitionTime: 500
        };
        var $body = $('body');
        var QuickSidebarComponent = (function (_super) {
            __extends(QuickSidebarComponent, _super);
            function QuickSidebarComponent() {
                _super.apply(this, arguments);
            }
            Object.defineProperty(QuickSidebarComponent.prototype, "$e", {
                get: function () {
                    return $('.quick-sidebar');
                },
                enumerable: true,
                configurable: true
            });
            QuickSidebarComponent.prototype.init = function () {
                this.app.debug.log('QuickSidebarComponent init');
                this.app.on('booted', function () {
                    packadic.debug.log('QuickSidebarComponent received event emitted from app: booted');
                });
            };
            QuickSidebarComponent.prototype.boot = function () {
                packadic.debug.log('QuickSidebarComponent debug');
                if (!this.exists()) {
                    return;
                }
                var ttOpts = _.merge(this.config('vendor.bootstrap.tooltip'), {
                    placement: 'left',
                    offset: '30px -40px',
                    trigger: 'hover focus',
                    selector: false
                });
                if (!packadic.isTouchDevice()) {
                    this.$e.find('.qs-header .btn[data-quick-sidebar]').tooltip(ttOpts);
                }
                this._initTabs();
                this._initBindings();
                this._initResizeHandler();
                if (!this.isClosed()) {
                    this.next();
                }
            };
            QuickSidebarComponent.prototype._initTabs = function () {
                var self = this;
                var $tabs = this.$e.find('.qs-tabs').first();
                this.$e.find('.qs-content').each(function () {
                    var tab = $('<div>')
                        .addClass('qs-tab')
                        .text($(this).attr('data-name'))
                        .attr('data-target', '#' + $(this).attr('id'));
                    tab.appendTo($tabs);
                });
            };
            QuickSidebarComponent.prototype._initBindings = function () {
                var self = this;
                $body.on('click', '[data-quick-sidebar]', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $this = $(this);
                    var action = $this.attr('data-quick-sidebar');
                    var target = $this.attr('data-target');
                    target = target || self.$e.find('qs-content').first();
                    switch (action) {
                        case 'open':
                            self.open(target);
                            break;
                        case 'close':
                            self.close();
                            break;
                        case 'pin':
                            self.isPinned() ? self.unpin() : self.pin();
                            break;
                        case 'toggle':
                            (self.isClosed() && self.open(target)) || self.close();
                            break;
                        case 'next':
                            self.next();
                            break;
                        case 'prev':
                            self.prev();
                            break;
                    }
                    packadic.debug.log('[data-quick-sidebar]', 'action: ', action, 'target: ', target);
                });
                $body.on('click', '.quick-sidebar .qs-header button', function (e) {
                    var $this = $(this);
                    $this.blur();
                });
                $body.on('click', '.quick-sidebar .qs-tab', function (e) {
                    self.open($(this).attr('data-target'));
                });
                $(document).on('click', '.qs-shown', function (e) {
                    if ($(e.target).closest('.quick-sidebar').length > 0) {
                        return;
                    }
                    if (self.isPinned()) {
                        return;
                    }
                    self.close();
                });
            };
            QuickSidebarComponent.prototype._initResizeHandler = function () {
                var self = this;
                var resizeHandler = function () {
                    console.log('qs resize', arguments);
                    if (self.isClosed()) {
                        return;
                    }
                    var active = self.getActive();
                    self.resetContent();
                    self.openTarget(active);
                };
                this.app
                    .on('resize', resizeHandler)
                    .on('footer:set-fixed', resizeHandler)
                    .on('header:set-fixed', resizeHandler);
            };
            QuickSidebarComponent.prototype.resetContent = function () {
                var active = this.getActive();
                if (active.length) {
                    packadic.plugins.destroySlimScroll(active.removeClass('active'));
                    this.$e.find('.slimScrollBar, .slimScrollRail').remove();
                }
                this.$e.find('.qs-content.active').removeClass('active');
            };
            QuickSidebarComponent.prototype.openTarget = function ($target) {
                var _this = this;
                var height = this.$e.outerHeight() - this.$e.find('.qs-header').outerHeight() - this.$e.find('.qs-tabs').outerHeight();
                $target.ensureClass('active');
                $(this).addClass('.active');
                this.$e.find('.qs-tabs .qs-tab').removeClass('active');
                this.$e.find('.qs-tabs .qs-tab[data-target="#' + $target.attr('id') + '"]').addClass('active');
                this.$e.css('overflow', 'hidden');
                setTimeout(function () {
                    _this.$e.css('overflow', 'auto');
                    packadic.plugins.makeSlimScroll($target, { height: height });
                    $target.trigger("mouseleave");
                }, this.config('quickSidebar.transitionTime'));
            };
            QuickSidebarComponent.prototype.isClosed = function () {
                return !$body.hasClass("qs-shown");
            };
            QuickSidebarComponent.prototype.exists = function () {
                return this.$e.length > 0;
            };
            QuickSidebarComponent.prototype.getActive = function () {
                return this.$e.find('.qs-content.active');
            };
            QuickSidebarComponent.prototype.open = function (target) {
                if (!this.exists()) {
                    return this;
                }
                if (this.$e.find(target).length == 0) {
                    target = '#' + this.$e.find('.qs-content').first().attr('id');
                }
                this.resetContent();
                $body.ensureClass("qs-shown", true);
                this.openTarget(this.$e.find(target));
                return this;
            };
            QuickSidebarComponent.prototype.close = function () {
                if (!this.exists()) {
                    return;
                }
                if (this.isPinned()) {
                    this.unpin();
                }
                this.resetContent();
                $body.ensureClass("qs-shown", false);
                return this;
            };
            QuickSidebarComponent.prototype.next = function () {
                var $next = this.getActive().parent().next('.qs-content:not(.active)');
                if ($next.length == 0) {
                    $next = this.$e.find('.qs-content').first();
                }
                console.log('next', $next);
                this.resetContent();
                this.openTarget($next);
                return this;
            };
            QuickSidebarComponent.prototype.prev = function () {
                var $prev = this.getActive().parent().prev('.qs-content:not(.active)');
                if ($prev.length == 0) {
                    $prev = this.$e.find('.qs-content').last();
                }
                this.resetContent();
                this.openTarget($prev);
                return this;
            };
            QuickSidebarComponent.prototype.isPinned = function () {
                return $body.hasClass('qs-pinned');
            };
            QuickSidebarComponent.prototype.pin = function () {
                $body.ensureClass('qs-pinned', true);
            };
            QuickSidebarComponent.prototype.unpin = function () {
                $body.removeClass('qs-pinned');
            };
            return QuickSidebarComponent;
        })(Component);
        layout.QuickSidebarComponent = QuickSidebarComponent;
        Components.register('quickSidebar', QuickSidebarComponent, defaultConfig);
    })(layout = packadic.layout || (packadic.layout = {}));
})(packadic || (packadic = {}));
//# sourceMappingURL=quick_sidebar.js.map