/*!
 *
 * Bancha Scaffolding Library
 * Copyright 2011-2012 Roland Schuetz
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * Bancha.scaffold.Grid Tests
 *
 * @package       Bancha.scaffold.Test
 * @copyright     Copyright 2011-2012 Roland Schuetz
 * @link          http://scaffold.banchaproject.org
 * @since         Bancha.scaffold 0.5.0
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @version       Bancha v PRECOMPILER_ADD_RELEASE_VERSION
 *
 * For more information go to http://scaffold.banchaproject.org
 */
/*jslint browser: true, vars: true, undef: true, nomen: true, eqeq: false, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: true, white: true */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, regexp:true, undef:true, trailing:false */
/*global Ext, Bancha, describe, it, beforeEach, expect, jasmine, Mock, BanchaScaffoldSpecHelper */

describe("Bancha.scaffold.Grid tests",function() {
    var model = BanchaScaffoldSpecHelper.getSampleModel, //shortcut
        gridScaf = Bancha.scaffold.Grid,
        // take the defaults
        // (actually this is also copying all the function references, but it doesn't matter)
        testDefaults = Ext.clone(gridScaf);
    
    // force easiert defaults for unit testing
    testDefaults = Ext.apply(testDefaults,{
        enableCreate:  false,
        enableUpdate:  false,
        enableDestroy: false,
        enableReset:   false,
        storeDefaults: {
            autoLoad: false // since we only want to unit-test and not laod data
        }
    });
    beforeEach(function() {
        // re-enforce defaults
        Ext.apply(gridScaf, testDefaults);
    });
    
    
    it("should build column configs while considering the defined defaults", function() {
        // define some defaults
        gridScaf.columnDefaults = {
            forAllFields: 'added'
        };
        gridScaf.gridcolumnDefaults = {
            justForText: true
        };
        gridScaf.datecolumnDefaults = {};

        expect(gridScaf.buildColumnConfig('string','someName')).toEqual({
            forAllFields: 'added',
            justForText: true,
            xtype : 'gridcolumn',
            text: 'Some name',
            dataIndex: 'someName'
        });

        // now there should be just added the first one
        expect(gridScaf.buildColumnConfig('date','someName')).toEqual({
            forAllFields: 'added',
            xtype : 'datecolumn',
            text: 'Some name',
            dataIndex: 'someName'
        });
    });

    it("should build column configs while considering special defaults per call", function() {
        gridScaf.columnDefaults = {
            forAllFields: 'added'
        };
        gridScaf.gridcolumnDefaults = {
            justForText: true
        };
        var defaults = {
            gridcolumnDefaults: {
                justForThisTextBuild: true
            }
        };
        
        expect(gridScaf.buildColumnConfig('string','someName',defaults)).toEqual({
            forAllFields: 'added',
            justForThisTextBuild: true, // <-- old defaults got overrided
            xtype : 'gridcolumn',
            text: 'Some name',
            dataIndex: 'someName'
        });

        // now there should be just added the first one
        expect(gridScaf.buildColumnConfig('date','someName',defaults)).toEqual({
            forAllFields: 'added',
            xtype : 'datecolumn',
            text: 'Some name',
            dataIndex: 'someName'
        });
    });
    
    // expected columns
    var expectedColumns = [{
        flex     : 1,
        xtype    : 'numbercolumn',
        format   : '0',
        text     : 'Id',
        hidden   : true,
        dataIndex: 'id'
    }, {
        flex     : 1,
        xtype   : 'gridcolumn',
        text     : 'Name',
        dataIndex: 'name'
    }, {
        flex     : 1,
        xtype    : 'gridcolumn',
        text     : 'Login',
        dataIndex: 'login'
    }, {
        flex     : 1,
        xtype    : 'datecolumn',
        text     : 'Created',
        dataIndex: 'created'
    }, {
        flex     : 1,
        xtype    : 'gridcolumn',
        text     : 'Email',
        dataIndex: 'email'
    }, {
        flex     : 1,
        xtype    : 'gridcolumn',
        text     : 'Avatar',
        dataIndex: 'avatar'
    }, {
        flex     : 1,
        xtype    : 'numbercolumn',
        text     : 'Weight',
        dataIndex: 'weight'
    }, {
        flex     : 1,
        xtype    : 'numbercolumn',
        format   : '0',
        text     : 'Height',
        dataIndex: 'height'
    }];
    
    it("should build a grid column config with #buildColumns (component test)", function() {
        // prepare
        model('MyTest.model.GridColumnsConfigTest');

        // test
        var result = gridScaf.buildColumns('MyTest.model.GridColumnsConfigTest');

        // compare
        expect(result).toEqual(expectedColumns);
    });
    
    
    it("should build a grid column config with #buildColumns with update "+
        "and delete functions (component test)", function() {
        // prepare
        model('MyTest.model.GridColumnsConfigWithUpdateDeleteTest');

        // expected columns
        var expectedColumnsWithUpdateDestroy = [{
            flex     : 1,
            xtype    : 'numbercolumn',
            format   : '0',
            text     : 'Id',
            dataIndex: 'id',
            field    : undefined,
            hidden   : true
        }, {
            flex     : 1,
            xtype    : 'gridcolumn',
            text     : 'Name',
            dataIndex: 'name',
            field    : {xtype:'textfield', name:'name'}
        }, {
            flex     : 1,
            xtype    : 'gridcolumn',
            text     : 'Login',
            dataIndex: 'login',
            field    : {xtype:'textfield', name:'login'}
        }, {
            flex     : 1,
            xtype    : 'datecolumn',
            text     : 'Created',
            dataIndex: 'created',
            field    : {xtype:'datefield', name:'created'}
        }, {
            flex     : 1,
            xtype    : 'gridcolumn',
            text     : 'Email',
            dataIndex: 'email',
            field    : {xtype:'textfield', name:'email'}
        }, {
            flex     : 1,
            xtype    : 'gridcolumn',
            text     : 'Avatar',
            dataIndex: 'avatar',
            field    : {xtype:'textfield', name:'avatar'}
        }, {
            flex     : 1,
            xtype    : 'numbercolumn',
            text     : 'Weight',
            dataIndex: 'weight',
            field    : {xtype:'numberfield', name:'weight'}
        }, {
            flex     : 1,
            xtype    : 'numbercolumn',
            format   : '0',
            text     : 'Height',
            dataIndex: 'height',
            field    : {xtype:'numberfield', allowDecimals : false, name:'height'}
        }, {
            xtype:'actioncolumn',
            width:50,
            items: [{
                icon: '/img/icons/delete.png',
                tooltip: 'Delete',
                handler: gridScaf.onDelete
            }]
        }];
        
        // test
        var result = gridScaf.buildColumns('MyTest.model.GridColumnsConfigWithUpdateDeleteTest', {
            enableUpdate  : true,
            enableDestroy : true
        });

        // compare
        expect(result).toEqual(expectedColumnsWithUpdateDestroy);
    });
    
    
    it("should build a grid panel config with #buildConfig (component test)", function() {
        // prepare
        model('MyTest.model.GridConfigTest');

        // test
        var result = gridScaf.buildConfig('MyTest.model.GridConfigTest');

        // should have a store
        expect(result.store.getProxy().getModel()).toBeModelClass('MyTest.model.GridConfigTest');
        
        // just a simple column check, buildColumns is already tested above
        expect(result.columns).toEqual(expectedColumns);
    });
    
    it("should clone all configs, so that you can create multiple grids from the same defaults "+
        "(component test)", function() {
        // prepare
        model('MyTest.model.GridConfigTwoTimesTest');

        // first
        var result = gridScaf.buildConfig('MyTest.model.GridConfigTwoTimesTest');
        // should have a store
        expect(result.store.getProxy().getModel()).toBeModelClass(
                'MyTest.model.GridConfigTwoTimesTest');
        // just a simple column check, buildColumns is already tested above
        expect(result.columns).toEqual(expectedColumns);
        
        // second
        result = gridScaf.buildConfig('MyTest.model.GridConfigTwoTimesTest');
        // should have a store
        expect(result.store.getProxy().getModel()).toBeModelClass(
                'MyTest.model.GridConfigTwoTimesTest');
        // just a simple column check, buildColumns is already tested above
        expect(result.columns).toEqual(expectedColumns);
    });
    
    
    it("should build a grid panel config with update and delete support with "+
        "#buildConfig (component test)", function() {
        // prepare
        model('MyTest.model.GridConfigWithUpdateDeleteTest');

        // test
        var result = gridScaf.buildConfig('MyTest.model.GridConfigWithUpdateDeleteTest', {
            enableUpdate  : true,
            enableDestroy : true
        });

        // should have a store
        expect(result.store.getProxy().getModel()).toBeModelClass(
                'MyTest.model.GridConfigWithUpdateDeleteTest');
        
        // just a simple column check, buildColumns is already tested above
        expect(result.columns.length).toEqual(9);

        // should have all columns editable
        // (the first is the id-field and therefore is guessed to don't have an editorfield)
        expect(result.columns[1].field.xtype).toEqual("textfield");
        
        // should be editable
        expect(result.selType).toEqual('cellmodel');
        // expect a celleditor plugin for update support
        expect(result).property("plugins.0").toBeOfClass("Ext.grid.plugin.CellEditing");
        // standardwise two clicks are expected for update start
        expect(result).property("plugins.0.clicksToEdit").toEqual(2);
        
        // should have an update button
        expect(result).property("dockedItems.0.items.1.iconCls").toEqual("icon-save");
    });
    
    
    it("should build a grid panel config with full crud support with "+
        "#buildConfig (component test)", function() {
        // prepare
        model('MyTest.model.GridConfigWithCRUDTest');

        // test
        var result = gridScaf.buildConfig('MyTest.model.GridConfigWithCRUDTest', {
            enableCreate    : true,
            enableUpdate    : true,
            enableReset : true,
            enableDestroy   : true
        },{
            additionalGridConfig: true
        });

        // should have a store
        expect(result.store.getProxy().getModel()).toBeModelClass(
                'MyTest.model.GridConfigWithCRUDTest');
        
        // just a simple column check, buildColumns is already tested above
        expect(result.columns.length).toEqual(9);

        // should be editable (simple check)
        expect(result.selType).toEqual('cellmodel');
        expect(result.plugins[0]).toBeOfClass("Ext.grid.plugin.CellEditing");
        
        // should have an create button
        var buttons = result.dockedItems[0].items;
        expect(buttons[1].iconCls).toEqual('icon-add');
        
        // should have an reset button
        expect(buttons[2].iconCls).toEqual('icon-reset');
        
        // should have an update button
        expect(buttons[3].iconCls).toEqual("icon-save");
        
        // should have added the additional grid config
        expect(result.additionalGridConfig).toBeTruthy();
    });
    
    
    it("should use class interceptors when building a config (component test)", function() {
        // prepare
        model('MyTest.model.GridConfigWithClassInterceptorsTest');
        
        // the same when defining them on the class
        Ext.apply(gridScaf,{
            beforeBuild: function() {
                return {
                    interceptors: ['before'] // make sure that afterBuild only augemts
                };
            },
            afterBuild: function(config) {
                config.interceptors.push('after');
                return config;
            },
            guessColumnConfigs: function(config) {
                config.isAugmented = true;
                return config;
            }
        });
        var result = gridScaf.buildConfig('MyTest.model.GridConfigWithClassInterceptorsTest');
        
        // beforeBuild, afterBuild
        expect(result.interceptors).toEqual(['before','after']);
        
        // guessFieldConfg
        expect(result.columns).toBeAnObject();
        Ext.each(result.columns, function(column) {
            expect(column.isAugmented).toEqual(true);
        });
    });
    
    
    it("should use config interceptors when building a config (component test)", function() {
        // prepare
        model('MyTest.model.GridConfigWithConfigInterceptorsTest');
        
        var result = gridScaf.buildConfig('MyTest.model.GridConfigWithConfigInterceptorsTest',{
            beforeBuild: function() {
                return {
                    interceptors: ['before'] // make sure that afterBuild only augemts
                };
            },
            afterBuild: function(config) {
                config.interceptors.push('after');
                return config;
            },
            guessColumnConfigs: function(config) {
                config.isAugmented = true;
                return config;
            }
        });
        
        // beforeBuild, afterBuild
        expect(result.interceptors).toEqual(['before','after']);
        
        // guessFieldConfg
        expect(result.columns).toBeAnObject();
        Ext.each(result.columns, function(column) {
            expect(column.isAugmented).toEqual(true);
        });
    });
	
}); //eo scaffold grid functions

// eof
