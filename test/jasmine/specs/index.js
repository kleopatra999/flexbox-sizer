import $ from 'jquery';
import Grid from '../../..';

describe('Grid', function() {
  function skipIfNoFlexbox() {
    loadFixtures('grid.html');
    if ($('.grid').css('display') !== 'flex') {
      console.log('Please run these tests in a browser that supports flexbox!');
      pending();
    }
  }

  function getRowDifference($items) {
    return $items.last().height() / $items.first().height();
  }

  beforeEach(function() {
    this._setup = (fixture = 'grid.html') => {
      loadFixtures(fixture);

      this.$context = $('.js-project');
      this.$window = $('.js-window');
      this.$grid = this.$context.find('.js-grid-main');
      this.$gridItems = this.$grid.find('.js-grid-item-container');
    };

    this._createGrid = (options = {}, fixture = 'grid.html') => {
      this._setup(fixture);

      this._grid = Grid.init(Object.assign({
        context: this.$context[0],
        window: this.$window[0],
      }, options));
    };
  });

  afterEach(function() {
    this._grid.destroy();
  });

  describe('.init', function() {
    it('creates an array of grids found in the context', function() {
      this._createGrid();

      expect(this._grid.grids).toHaveLength(1);
    });

    it('binds a window resize handler for every grid found in the context', function() {
      this._createGrid();
      spyOn(this._grid.grids[0], '_autoSizeGrid');

      this.$window.trigger('resize');

      expect(this._grid.grids[0]._autoSizeGrid).toHaveBeenCalled();
    });

    it('binds a window orientationchange handler for every grid found in the context', function() {
      this._createGrid();
      spyOn(this._grid.grids[0], '_autoSizeGrid');

      this.$window.trigger('orientationchange');

      expect(this._grid.grids[0]._autoSizeGrid).toHaveBeenCalled();
    });

    it('binds a window "refresh-grid" handler for every grid found in the context', function() {
      this._createGrid();
      spyOn(this._grid.grids[0], 'refresh');

      this.$window.trigger('refresh-grids');

      expect(this._grid.grids[0].refresh).toHaveBeenCalled();
    });
  });

  describe('rendering', function() {
    beforeEach(skipIfNoFlexbox);

    it('resizes the grid so that last row is not too tall', function() {
      const maxRatio = 1.5;
      let rowHeights;

      this._setup();
      expect(getRowDifference(this.$gridItems)).toBeGreaterThan(maxRatio);

      this._createGrid({ maxRatio });
      expect(getRowDifference(this.$gridItems)).toBeLessThan(maxRatio);
    });

    it('correctly calculates perfect grid with subpixels so that spacer is unnecessary', function() {
      const maxRatio = 1.5;

      this._createGrid({ maxRatio, breakpoints: [] }, 'gridSubpixel.html');
      expect($('.js-grid-spacer').css('display')).toBe('none');
    });
  });

  describe('breakpoints', function() {
    beforeEach(skipIfNoFlexbox);

    it('uses default flex-grow when no breakpoints are provided', function() {
      this._createGrid({ breakpoints: [] });

      const expectedBeforeResize = 180;
      const expectedAfterResize = 193;

      expect(this.$gridItems.eq(0).width()).toBeLessThan(expectedBeforeResize);

      this.$grid.width(600);
      this.$window.trigger('resize');

      expect(this.$gridItems.eq(0).width()).toBe(expectedAfterResize);
    });

    it('uses a scaled flex-grow when breakpoints are provided', function() {
      this._createGrid({
        breakpoints: [{
          width: 1200,
          modifier: .1,
        }],
      });

      const expectedBeforeResize = 140;
      const expectedAfterResize = 13;

      expect(this.$gridItems.eq(0).width()).toBeLessThan(expectedBeforeResize);

      this.$grid.width(600);
      this.$window.trigger('resize');

      expect(this.$gridItems.eq(0).width()).toBe(expectedAfterResize);
    });
  });
});
