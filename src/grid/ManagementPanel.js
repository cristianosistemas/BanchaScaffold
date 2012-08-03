/*
 *
 * Bancha Scaffolding Library
 * Copyright 2011-2012 Roland Schuetz
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @package       Bancha.scaffold
 * @copyright     Copyright 2011-2012 Roland Schuetz
 * @link          http://scaffold.banchaproject.org
 * @since         Bancha.scaffold 0.5.3
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @version       Bancha.scaffold v PRECOMPILER_ADD_RELEASE_VERSION
 *
 * For more information go to http://scaffold.banchaproject.org
 */
/*jslint browser: true, vars: true, undef: true, nomen: true, eqeq: false, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: true, white: true */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, regexp:true, undef:true, trailing:false */
/*global Ext:false, Bancha:false, window:false */


Ext.require(['Ext.grid.Panel', 'Bancha.scaffold'], function () {


    /**
     * @class Bancha.grid.ManagementPanel
     * This will create a TabPanel with one tab per model.
     * It will autodetect the models capabilities from the proxy.
     *
     * Example: 
     *
     *     Ext.create('Bancha.grid.ManagementPanel', {
     *         models: [
     *             'MyApp.model.User',
     *             'MyApp.model.Post'
     *         ]
     *     });
     *
     * @author Roland Schuetz <mail@rolandschuetz.at>
     * @docauthor Roland Schuetz <mail@rolandschuetz.at>
     */
    Ext.define('Bancha.grid.ManagementPanel', {
        extend: 'Ext.tab.Panel',
        alias: 'widget.managementpanel',

        /**
         * @cfg {[String|Ext.data.Model]} models
         * Define the models which should be added to the panel.
         */
        models: [],
        initComponent: function () {
            // IFDEBUG
            if(!Ext.isArray(this.models)) {
                Ext.Error.raise({
                    plugin: 'Bancha.scaffold',
                    msg: ['Bancha.grid.ManagementPanel\'s models config has to be an array, ',
                         'instead got ' + this.scaffold + ' (of type ' + (typeof this.scaffold) + ')'].join('')
                });
            }
            // ENDIF
            this.models = this.models || [];
            this.items = this.items || [];

            // build up all screens
            var items = this.items;
            Ext.each(this.models, function(model) {
                var modelName = Ext.isString(model) ? model : model.getName();
                model = Ext.ModelManager.getModel(modelName);

                var tabitem = {
                    xtype: 'gridpanel',
                    title: Bancha.scaffold.Util.toTitle(
                                Bancha.scaffold.Util.humanizeClassName(modelName)),
                    scaffold: {
                        storeDefaults: {},
                        target: modelName,
                        buttons: false,
                        deletable: true
                    }
                };

                var proxy = model.getProxy();
                if(proxy.api) {
                    // it's an ext direct proxy
                    var buttons = ['->'];
                    if(proxy.api.create) {
                        buttons.push('create');
                    }
                    if(proxy.api.create || proxy.api.update) {
                        buttons.push('reset');
                        buttons.push('save');
                    }
                    if(buttons.length > 1) {
                        // the model supports create and/or save
                        tabitem.scaffold.buttons = buttons;
                    }
                    if(!proxy.api.destroy) {
                        tabitem.scaffold.deletable = false;
                    }
                } else if(proxy.writer) {
                    // we can see that there is a writer, so provide all buttons
                    delete tabitem.scaffold.buttons;
                }

                items.push(tabitem);
            }); //eo each

            this.callParent();
        }
    });

}); //eo require

//eof
