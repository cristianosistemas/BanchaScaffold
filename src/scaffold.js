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
 * @since         Bancha.scaffold 0.0.1
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 * @author        Roland Schuetz <mail@rolandschuetz.at>
 * @version       Bancha.scaffold v PRECOMPILER_ADD_RELEASE_VERSION
 *
 * For more information go to http://scaffold.banchaproject.org
 */
/*jslint browser: true, vars: true, undef: true, nomen: true, eqeq: false, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: true, white: true */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, regexp:true, undef:true, trailing:false */
/*global Ext:false, Bancha:false, window:false */


// This file should be separated in three clean singleton classes



/**
 * @class Bancha.scaffold
 * 
 * The Bancha ExtJS 4 Scaffold library helps you easily prototype Ext.grid.Panels and Ext.form.Panels, 
 * helping you creating beautiful prototypes in minutes. And it it completly free and open source!
 * 
 * Simple grid example:
 *
 *     Ext.create('Ext.grid.Panel',{
 *         scaffold: 'MyApp.model.User',
 *         title: 'User Grid',
 *         renderTo: 'gridpanel'
 *     });
 *
 * Simple form example:
 *
 *     Ext.create('Ext.form.Panel',{
 *         scaffold: 'MyApp.model.User',
 *         title: 'User Grid',
 *         renderTo: 'gridpanel'
 *     });
 *
 * Custom button structure example:
 *
 *     Ext.create('Ext.grid.Panel',{
 *         scaffold: {
 *              target: 'MyApp.model.User',
 *              buttons: ['->','save']
 *         },
 *         title: 'User Grid',
 *         renderTo: 'gridpanel'
 *     });
 *
 * @singleton
 * @author Roland Schuetz <mail@rolandschuetz.at>
 * @docauthor Roland Schuetz <mail@rolandschuetz.at>
 */
Ext.define('Bancha.scaffold', {

    /* Begin Definitions */
    singleton: true,
    requires: ['Ext.form.field.VTypes','Ext.data.validations'],
    
    /**
     * @singleton
     * @class Bancha.scaffold.Util
     * Some scaffolding util functions
     * 
     * @author Roland Schuetz <mail@rolandschuetz.at>
     * @docauthor Roland Schuetz <mail@rolandschuetz.at>
     */
    Util: {
        /**
         * Makes the first letter of an string upper case
         * @param {String} str
         * @return {String} str with first letter upper case
         * @member Bancha.scaffold.Util
         */
        toFirstUpper: function (str) {
            if (typeof str !== 'string') {
                return str;
            }
            if (str.length === 1) {
                return str.toUpperCase();
            }
            return str[0].toUpperCase() + str.substr(1);
        },
        /**
         * Capitalizes the first word, turns underscores into spaces and strips trailing "_id".  
         * Also it converts camel case by finding upper case letters right after lower case and replaceing the upper case with an space and lower case.  
         * examples:  
         * "user_name"  -> "User name"  
         * "userName"   -> "User name"  
         * "John Smith" -> "John Smith"  
         *
         * @param {String} str
         * @return {String} transformed string
         * @member Bancha.scaffold.Util
         */
        humanize: function (str) {
            str = str.replace(/_id/g, ''); // delete _id from the string
            str = str.replace(/_/g, ' '); // _ to spaces
            str = str.replace(/([a-z])([A-Z])/g, function (all, first, second) {
                return first + " " + second.toLowerCase();
            }); // convert camel case (only)
            return this.toFirstUpper(str);
        },
        /**
         * Transforms a namespacd class name like 'Bancha.model.AwesomeArticle' 
         * and transforms it into a name you can show to users, in this case 
         * 'Awesome article'
         *
         * For details on how the transformation, see also {@link #humanize}
         *
         * @param {String} classname
         * @return {String} transformed string
         * @member Bancha.scaffold.Util
         */
        humanizeClassName: function(classname) {
            // get the class name without any namespacing
            if(classname.indexOf('.')) {
                classname = classname.substr(classname.lastIndexOf('.')+1);
            }
            return this.humanize(classname);
        },
        /**
         * Makes every words first letter upper case.
         *
         * @param {String} str string of words, separated by space
         * @return {String} transformed string
         * @member Bancha.scaffold.Util
         */
        toTitle: function(str) {
            return str.replace(/ ([a-z])/g, function (all, letter) {
                return ' ' + letter.toUpperCase();
            });
        },
        /**
         * @private
         * DEPRECATED - CURRENTLY NOT USED  
         * This enables the developer to change the default scaffolding functions at any time
         * and the Scaffold Library will always use the current functions, since there are no references
         * @member Bancha.scaffold.Util
         */
        createFacade: function (scopeName, scope, method) {
            // IFDEBUG
            /*
             * totally stupid, but we need a singleton pattern in debug mode here, since
             * jasmine provides us only with VERY little compare options
             */
            this.singletonFns = this.singletonFns || {};
            this.singletonFns[scopeName] = this.singletonFns[scopeName] || {};
            this.singletonFns[scopeName][method] = this.singletonFns[scopeName][method] ||
            function () {
                return scope[method].apply(this, arguments);
            };
            return this.singletonFns[scopeName][method];
            // ENDIF
            /* IFPRODUCTION
            return function() {
            return scope[method].apply(scope,arguments);
            };
            ENDIF */
        },
        /**
         * @private
         * This function will search for 'create', 'reset' and 'save' and will 
         * properly replace them with the values from the config object
         *    
         * It will also inject the scope into all elements where the scope 
         * equals 'scaffold-scope-me'
         *
         * @param buttons the  button config, e.g. ['->','create','reset','save']
         * @param config the config which holds all necessary replacements 
         *               (config.onCreate, config.createButtonConfig, config.onReset, ...)
         * @param buttonScope the scope, that's applied to all replaced buttons
         * @return the build buttons array
         */
        replaceButtonPlaceHolders: function(buttons, config, buttonScope) {
            if(typeof buttons === 'undefined' || buttons.length===0) {
                return buttons;
            }

            for(var i=0, len=buttons.length; i<len; i++) {
                switch(buttons[i]) {
                    case 'create': 
                        buttons[i] = Ext.apply(config.createButtonConfig, {
                            scope: buttonScope,
                            handler: config.onCreate
                        });
                        break;
                    case 'reset': 
                        buttons[i] = Ext.apply(config.resetButtonConfig, {
                            scope: buttonScope,
                            handler: config.onReset
                        });
                        break;
                    case 'save': 
                        buttons[i] = Ext.apply(config.saveButtonConfig, {
                            scope: buttonScope,
                            handler: config.onSave
                        });
                        break;
                    default: 
                        // check if we should inject a scope
                        if(buttons[i].scope === 'scaffold-scope-me') {
                            buttons[i].scope = buttonScope;
                        }
                }
            }
            return buttons;
        },
        /**
         * for separation of concerns, gets/creates a store.
         * Used to build the grid store and to build associated stores.
         *
         * @param model {Ext.data.Model} A model
         * @param config {Object} A config object with the properties
         *                        oneStorePerModel and storeDefaultClass
         * @return {Ext.data.Store} A store
         */
        getStore: (function (model, config) {
            var stores = {};

            return function (model, config) {
                var modelName = Ext.ClassManager.getName(model),
                    store;
                if (config.oneStorePerModel && stores[modelName]) {
                    return stores[modelName];
                }

                store = Ext.create(config.storeDefaultClass || "Ext.data.Store", Ext.apply({
                    model: modelName
                }, Ext.clone(config.storeDefaults)));

                if (config.oneStorePerModel) {
                    stores[modelName] = store;
                }

                return store;
            };
        }()),
        /**
         * Tries to find the most usefull model field for dispaying. This is
         * used in the Grid scaffolding renderer for associations and can be
         * overwritten at any time.
         *
         * By default it used the models "displayField" config, which just exists
         * in Bancha.Scaffold
         *
         * @param model {Ext.data.Model} the model to look through
         * @return {String} the most accurate field name
         */
        getDisplayFieldName: function(model) {
            // if defined use the display field config
            if(Ext.isString(model.displayField)) {
                return model.displayField;
            }

            // get the field names
            var fieldNames = Ext.Array.pluck(model.getFields(), 'name');

            // try to find name, title or code
            if(fieldNames.indexOf('name') !== -1) {
                return 'name';
            }
            if(fieldNames.indexOf('title') !== -1) {
                return 'title';
            }
            if(fieldNames.indexOf('code') !== -1) {
                return 'code';
            }

            // nothing usefull found
            return model.idProperty || fieldNames[0];
        }, 
        /**
         * This function may need to be customized, it generates the expected model associations "name" value,
         * to check if this field has a association (this is used for replacing id values with actual data).
         *
         * The default uses cake php naming conventions, e.g.
         * fieldname 'book_author_id' -> association name 'bookAuthors'
         * @param {String} the fields name of an model, e.g. 'title'
         * @param {String} the association type, e.g. belongsTo
         * @return the guessed association name
         */
        fieldNameToModelAssociationName: function(modelFieldName, associationType) {
            if(!Ext.isString(modelFieldName)) {
                return;
            }

            var parts = modelFieldName.split('_');
            if(parts.length<2 || parts[parts.length-1] !== 'id') {
                return;
            }
            parts.pop(); // remove 'id'

            var name = parts.shift(); // the first stays lower case
            Ext.each(parts, function(part) {
                name += part.substr(0,1).toUpperCase() + part.substr(1);
            });

            return associationType==='belongsTo' ? name : name+'s';
        },
        /**
         * Returns the corresponding association for a given field, or false
         *
         * @param field the model field to look for an association (belongsTo)
         * @param model the fields model
         * @return {Ext.data.association.belongsTo||False} the found association
         */
        getBelongsToAssociation: function(field, model) {
            var associationName = this.fieldNameToModelAssociationName(field.name, 'belongsTo'),
                associations = Ext.isFunction(model.getAssociations) ? model.getAssociations():
                                (model.prototype ? model.prototype.associations : false),
                association = (associationName && associations) ? associations.get(associationName) : false;

            return association;
        }
    },
    /**
     * @class Bancha.scaffold.Grid
     * @singleton
     * 
     * This class is a factory for creating Ext.grid.Panel's. It uses many data from
     * the given model, including field configs and validation rules. 
     * 
     * In most cases you will use our configurations on {@link Ext.grid.Panel}. The
     * simplest usage is:
     *     Ext.create("Ext.grid.Panel", {
     *         scaffold: 'MyApp.model.User', // the model name
     *     });
     *
     * A more complex usage example is:
     *     Ext.create("Ext.grid.Panel", {
     *
     *         // for more configurations
     *         scaffold: {
     *
     *             // define the model name here
     *             target: 'MyApp.model.User',
     *
     *             // enable full CRUD on the grid (default)
     *             deletable: true,
     *             buttons: ['->','create','reset','save'],
     *             
     *             
     *             // and some more advanced configs
     *             columnDefaults: {
     *                 width: 200
     *             },
     *             datecolumnDefaults: {
     *                 format: 'm/d/Y'
     *             },
     *             // use the same store for all grids
     *             oneStorePerModel: true,
     *             // custom onSave function
     *             onSave: function() {
     *                 Ext.MessageBox.alert("Tada","You've pressed the save button");
     *             },
     *             formConfig: {
     *                 textfieldDefaults: {
     *                     minLength: 3
     *                 }
     *             }
     *         },
     *     
     *         // and add some styling
     *         height   : 350,
     *         width    : 650,
     *         frame    : true,
     *         title    : 'User Grid',
     *         renderTo : 'gridpanel'
     *     });
     *    
     * If the editable property is true, 
     * {@link Bancha.scaffold.Form} is used to create the editor fields.
     *
     * You have three possible interceptors:  
     *  - beforeBuild         : executed before {@link #buildConfig}  
     *  - transformFieldConfig: executed after a field config is created, see {@link #transformFieldConfigs}  
     *  - afterBuild          : executed after {@link #buildConfig} created the config
     * 
     * @author Roland Schuetz <mail@rolandschuetz.at>
     * @docauthor Roland Schuetz <mail@rolandschuetz.at>
     */
    Grid: {
        /**
         * @private
         * DEPRECATED - CURRENTLY NOT USED  
         * Shorthand for {@llink Bancha.scaffold.Util#createFacade}
         */
        createFacade: function (method) {
            return Bancha.scaffold.Util.createFacade('Grid', this, method);
        },
        /**
         * @private
         * @property
         * Maps model types with column types and additional configs for prototyping
         */
        fieldToColumnConfigs: {
            'auto': {
                xtype: 'gridcolumn'
            },
            'string': {
                xtype: 'gridcolumn'
            },
            'int': {
                xtype: 'numbercolumn',
                format: '0'
            },
            'float': {
                xtype: 'numbercolumn'
            },
            'boolean': {
                xtype: 'booleancolumn'
            },
            'bool': {
                xtype: 'booleancolumn'
            },
            // a synonym
            'date': {
                xtype: 'datecolumn'
            }
        },
        /**
         * @property {String[]}
         * Exclude some model fields from scaffolding
         */
        exclude: [],
        /**
         * @property
         * This config is applied to each scaffolded column config
         */
        columnDefaults: {
            flex: 1 // foreFit the columns to take the whole available space
        },
        /**
         * @property
         * This config is applied to each scaffolded Ext.grid.column.Grid
         */
        gridcolumnDefaults: {},
        /**
         * @property
         * This config is applied to each scaffolded Ext.grid.column.Number
         */
        numbercolumnDefaults: {},
        /**
         * @property
         * This config is applied to each scaffolded Ext.grid.column.Boolean
         */
        booleancolumnDefaults: {},
        /**
         * @property
         * This config is applied to each scaffolded Ext.grid.column.Column
         */
        datecolumnDefaults: {},
        /**
         * @property {Object}
         * If the editable property is true, these configurations will be applied
         * for building the editor fields. See {@link #Bancha.scaffold.Form} for 
         * all configuration options
         */
        formConfig: {},
        /**
         * @property
         * The defaults class to create an store for grid scaffolding. (Default: "Ext.data.Store")
         */
        storeDefaultClass: "Ext.data.Store",
        /**
         * @property
         * Defaults for all grid stores created with this scaffolding.  
         * Default:
         *    {
         *      autoLoad: true
         *    }
         */
        storeDefaults: {
            autoLoad: true
        },
        /**
         * @property
         * True to use only one store per model (singleton),
         * false to create a new store each time.
         */
        oneStorePerModel: true,
        /**
         * @property {Function} transformColumnConfig Writable function used to add some custom behaviour.
         *
         * This function can be overwritten by any custom function.
         * @param {Object} columnConfig the column config to transform
         * @param {String} modelType A standard model field type like 'string' (also supports 'file' for compability with http://banchaproject.org)
         * @return {Object} Returns an Ext.grid.column.* configuration object
         */
        transformColumnConfig: function (columnConfig, modelType) {
            return columnConfig;
        },
        /**
         * @private
         * @property {Function} internalTransformColumnConfig 
         * This function just hides id columns and makes it uneditable.
         * @param {Object} columnConfig the column config to transform
         * @param {String} modelType A standard model field type like 'string' (also supports 'file' for compability with http://banchaproject.org)
         * @return {Object} Returns an Ext.grid.column.* configuration object
         */
        internalTransformColumnConfig: function (columnConfig, modelType) {
            if (columnConfig.dataIndex === 'id') {
                columnConfig.hidden = true;
                columnConfig.field = undefined;
            }

            return columnConfig;
        },
        /**
         * @private
         * Builds a column with all defaults defined here
         * @param {Sring} type The model field type
         * @param {Object} defaults (optional) Defaults like numbercolumnDefaults as property of this config.
         * See {@link #buildConfig}'s config property
         * @return {Object} Returns an Ext.grid.column.* configuration object
         */
        buildDefaultColumnFromModelType: function (type, defaults) {
            defaults = defaults || {};
            var column = this.fieldToColumnConfigs[type],
                columnDefaults = Ext.clone(defaults.columnDefaults || this.columnDefaults),
                // make a new object of defaults
                columnTypeDefaults = defaults[column.xtype + 'Defaults'] || this[column.xtype + 'Defaults'];
            return Ext.apply(columnDefaults, column, columnTypeDefaults);
        },
        /**
         * @private
         * Creates a Ext.grid.Column config from an model field type
         * @param {Sring} The model field
         * @param {Sring} The field's model
         * @param {Object} config the grid config object
         *                 See {@link #buildConfig}'s config property
         * @param {Object} gridListeners the grid listeners array, can be 
         *                 augmented by this function
         * @param {Array} (optional) validations An array of Ext.data.validations of the model
         * @return {Object} Returns an Ext.grid.column.* configuration object
         */
        buildColumnConfig: function (field, model, config, validations, gridListeners) {
            var fieldType = field.type.type,
                column = this.buildDefaultColumnFromModelType(fieldType, config),
                formConfig,
                association,
                store,
                fieldName;

            // infer name
            if (field.name) {
                column.text = Bancha.scaffold.Util.humanize(field.name);
                column.dataIndex = field.name;
            }

            // check for associations
            association = Bancha.scaffold.Util.getBelongsToAssociation(field, model);
            if(association) {
                // load the store
                store = Bancha.scaffold.Util.getStore(association.associatedModel, config);
                fieldName = Bancha.scaffold.Util.getDisplayFieldName(association.associatedModel); // calculate this only once per column

                // build a renderer
                column.renderer = function(id) {
                    var rec = store.getById(id);

                    // display either the found record name or Unknown
                    return rec ? rec.get(fieldName) : (Bancha.t ? Bancha.t('Unknown') : 'Unknown');
                };

                // if necessary re-render when the data is available
                gridListeners.render = Ext.Function.createSequence(gridListeners.render || Ext.emptyFn, function(gridpanel) {
                    if(store.getCount() === 0) {
                        store.on('load', function(store, records, successful, eOpts) {
                            if(successful) {
                                // re-render
                                gridpanel.getView().refresh();
                            }
                        });
                    }
                });
            } //eo if association

            // add an editor
            if(config.editable) {
                formConfig = config.formConfig || {};
                formConfig = Ext.apply({}, formConfig, Ext.clone(Bancha.scaffold.Form));
                // take the store config from the grid config
                formConfig.storeDefaults = config.storeDefaults;
                formConfig.oneStorePerModel = config.oneStorePerModel;
                // build the editor field
                column.field = Bancha.scaffold.Form.buildFieldConfig(field, model, formConfig, validations, true);

                // now make custom field transforms
                column.field = formConfig.internalTransformFieldConfig(column.field, fieldType);
                if (typeof formConfig.transformFieldConfig === 'function') {
                    column.field = formConfig.transformFieldConfig(column.field, fieldType);
                }
            }

            // now make custom transforms
            column = config.internalTransformColumnConfig(column, fieldType);
            if (typeof config.transformColumnConfig === 'function') {
                column = config.transformColumnConfig(column, fieldType);
            }

            return column;
        },
        /**
         * @property
         * Editable function to be called when the create button is pressed.  
         * To change the default scaffolding behaviour just replace this function.  
         *   
         * The scope provides two functions:  
         *  - this.getStore() to get the grids store  
         *  - this.getCellEditing() to get the grids cell editing plugin  
         */
        onCreate: function () {
            var edit = this.getCellEditing(),
                grid = edit.grid,
                store = this.getStore(),
                model = store.getProxy().getModel(),
                rec, visibleColumn = false;

            // Cancel any active editing.
            edit.cancelEdit();

            // create new entry
            rec = Ext.create(Ext.ClassManager.getName(model), {});

            // add entry
            store.insert(0, rec);

            // find first visible column
            Ext.each(grid.columns, function (el, i) {
                if (el.hidden !== true) {
                    visibleColumn = i;
                    return false;
                }
            });

            // start editing
            if (visibleColumn) {
                edit.startEditByPosition({
                    row: 0,
                    column: visibleColumn
                });
            }
        },
        /**
         * @property
         * Editable function to be called when the save button is pressed.  
         * To change the default scaffolding behaviour just replace this function.  
         *   
         * The scope provides two functions:  
         *  - this.getStore() to get the grids store  
         *  - this.getCellEditing() to get the grids cell editing plugin  
         */
        onSave: function () {
            var valid = true,
                msg = '',
                name,
                store = this.getStore();

            // check if all changes are valid
            store.each(function (el) {
                if (!el.isValid()) {
                    valid = false;
                    name = el.get('name') || el.get('title') || (el.phantom ? "New entry" : el.getId());
                    msg += "<br><br><b>" + name + ":</b>";
                    el.validate().each(function (error) {
                        msg += "<br>&nbsp;&nbsp;&nbsp;" + error.field + " " + error.message;
                    });
                }
            });

            if (!valid) {
                Ext.MessageBox.show({
                    title: 'Invalid Data',
                    msg: '<div style="text-align:left; padding-left:50px;">There are errors in your data:' + msg + "</div>",
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK
                });
            } else {
                // commit create and update
                store.sync();
            }
        },
        /**
         * @property
         * Editable function to be called when the reset button is pressed.  
         * To change the default scaffolding behaviour just replace this function.  
         *   
         * The scope provides two functions:  
         *  - this.getStore() to get the grids store  
         *  - this.getCellEditing() to get the grids cell editing plugin  
         */
        onReset: function () {
            // reject all changes
            var store = this.getStore();
            store.each(function (rec) {
                if (rec && rec.modified) {
                    rec.reject();
                }
                if (rec && rec.phantom) {
                    store.remove(rec);
                }
            });

            // TODO fix this really ugly thing
            // there is a strange bug going on, when you change all records, 
            // and then create a new one and then hit reset, the original first
            // record becomes undefined and is not reset
            // That's why we iterate here two times and check for rec beeing truthy
            store.each(function (rec) {
                if (rec && rec.modified) {
                    rec.reject();
                }
                if (rec && rec.phantom) {
                    store.remove(rec);
                }
            });
        },
        /**
         * @property
         * Editable function to be called when the delete button is pressed.  
         * To change the default scaffolding behaviour just replace this function.  
         *   
         * Scope can be defined in destroyButtonConfig.items[0].scope, but normally 
         * you don't need a scope here, since the arguments already provide everything.
         */
        onDelete: function (grid, rowIndex, colIndex) {
            var store = grid.getStore(),
                rec = store.getAt(rowIndex),
                name = Ext.getClassName(rec),
                displayName = Bancha.scaffold.Util.humanizeClassName(name);

            // instantly remove vom ui
            store.remove(rec);

            // sync to server
            // for before-ExtJS 4.1 the callbacks will be ignored, 
            // since they were added in 4.1
            store.sync({
                success: function (record, operation) {
                    Ext.MessageBox.show({
                        title: displayName + ' record deleted',
                        msg: displayName + ' record was successfully deleted.',
                        icon: Ext.MessageBox.INFO,
                        buttons: Ext.Msg.OK
                    });
                },
                failure: function (record, operation) {

                    // since it couldn't be deleted, add again
                    store.add(rec);

                    // inform user
                    Ext.MessageBox.show({
                        title: displayName + ' record could not be deleted',
                        msg: operation.getError() || (displayName + ' record could not be deleted.'),
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK
                    });
                }
            });

        },
        /**
         * @property
         * If true all cells become editable by double-click. If false 
         * Bancha doesn't create editor properties for columns.
         * The buttons 'create' and 'save' expect this to be true
         */
        editable: true,
        /**
         * @property
         * If true a destroy button is rendered for each record. 
         * See also {@link #destroyButtonConfig}
         */
        deletable: true,
        /**
         * @property
         * If an array of elements, a footer toolbar is rendered.
         * 'create','reset' and 'save' will be replaced by scaffolded
         * buttons, other elements are treated like default ExtJS items.
         *    
         * Inside your own buttons you can set the scope property to
         * 'scaffold-scope-me', this scope provides two functions:  
         *  - this.getStore() to get the grids store  
         *  - this.getCellEditing() to get the grids cell editing plugin  
         *    
         * Default: ['->','create','reset','save']
         */
        buttons: ['->','create','reset','save'],
        /**
         * @property
         * Default create button config, used in buttons config. 
         * If not defined scope and handler properties will be set by 
         * the build function.
         */
        createButtonConfig: {
            iconCls: 'icon-add',
            text: 'Create'
        },
        /**
         * @property
         * Default save button config, used in buttons config
         * If not defined scope and handler properties will be set by 
         * the build function.
         */
        saveButtonConfig: {
            iconCls: 'icon-save',
            text: 'Save'
        },
        /**
         * @property
         * Default reset button config, used in buttons config
         * If not defined scope and handler properties will be set by 
         * the build function.
         */
        resetButtonConfig: {
            iconCls: 'icon-reset',
            text: 'Reset'
        },
        /**
         * @property
         * Default last column config, used if deletable is true to render a destroy 
         * button at the end of the line.  
         * The button handler is expected at destroyButtonConfig.items[0].handler, if it is 
         * equal Ext.emptyFn it will be replace, otherwise the custom config is used.
         */
        destroyButtonConfig: {
            xtype: 'actioncolumn',
            width: 50,
            items: [{
                icon: '/img/icons/delete.png',
                tooltip: 'Delete',
                handler: Ext.emptyFn // will be replaced by button handler
            }]
        },
        /**
         * @private
         * Builds grid columns from the model definition, for scaffolding purposes.  
         * Please use {@link #Ext.grid.Panel} or {@link #buildConfig} if you want 
         * support for create,update and/or destroy!
         * 
         * @param {Ext.data.Model|String} model The model class or model name
         * @param {Object} config (optional) Any applicable property of 
         * Bancha.scaffold.Grid can be overrided for this call by declaring it
         * here. E.g.:
         *     {
         *         oneStorePerModel: true
         *     }
         * @param {Object} gridListeners the grid listeners array, can be 
         *                 augmented by this function
         * @return {Array} Returns an array of Ext.grid.column.* configs
         */
        buildColumns: function (model, config, gridListeners) {
            var columns = [],
                validations, button;
            config = Ext.apply({}, config, Ext.clone(this)); // get all defaults for this call


            // IFDEBUG
            if (!Ext.isDefined(model) || ((Ext.isString(model) && !Ext.ModelManager.isRegistered(model)) && !model.isModel)) {
                Ext.Error.raise({
                    plugin: 'Bancha.scaffold',
                    msg: 'Bancha Scaffold: Bancha.scaffold.Grid.buildColumns() expected the model or model name as first argument, instead got ' + model + '(of type' + (typeof model) + ')'
                });
            }
            // ENDIF

            if (Ext.isString(model)) {
                // IFDEBUG
                if (!Ext.isDefined(Ext.ModelManager.getModel(model))) {
                    Ext.Error.raise({
                        plugin: 'Bancha.scaffold',
                        model: model,
                        msg: 'Bancha Scaffold: First argument for Bancha.scaffold.Grid.buildColumns() is the string "' + model + '", which  is not a valid model class name. Please define a model first (for Bancha users: see Bancha.getModel() and Bancha.createModel())'
                    });
                }
                // ENDIF
                model = Ext.ModelManager.getModel(model);
            }

            if(!Ext.isArray(config.exclude)) {
                // IFDEBUG
                Ext.Error.raise({
                    plugin: 'Bancha.scaffold',
                    model: model,
                    msg: 'Bancha Scaffold: When scaffolding a grid panel the exclude property should be an array of field names to exclude.'
                });
                // ENDIF
                config.exclude = [];
            }

            // build all columns
            validations = model.prototype.validations;
            model.prototype.fields.each(function (field) {
                if(config.exclude.indexOf(field.name) === -1) {
                    columns.push(
                        Bancha.scaffold.Grid.buildColumnConfig(field, model, config, validations, gridListeners));
                }
            });

            // add a destroy button
            if (config.deletable) {
                button = Ext.clone(config.destroyButtonConfig);
                if (button.items[0].handler === Ext.emptyFn) {
                    button.items[0].handler = config.onDelete;
                }
                columns.push(button);
            }

            return columns;
        },
        /**
         * @method
         * You can replace this function! The function will be executed before each 
         * {@link #buildConfig} as interceptor. 
         * @param {Ext.data.Model} model see {@link #buildConfig}
         * @param {Object} config the scaffold full config for this call
         * @param {Object|Undefined} initialPanelConfig see {@link #buildConfig}'s initialPanelConfig property
         * @return {Object|Undefined} object with initial Ext.form.Panel configs
         */
        beforeBuild: function (model, config, initialPanelConfig) {},
        /**
         * @method
         * You can replace this fucntion! This function will be executed after each 
         * {@link #buildConfig} as interceptor.
         * @param {Object} gridConfig the just build grid panel config
         * @param {Ext.data.Model} model see {@link #buildConfig}
         * @param {Object} config the scaffold full config for this call
         * @param {Object|Undefined} initialPanelConfig see {@link #buildConfig}'s initialPanelConfig property
         * @return {Object|Undefined} object with final Ext.grid.Panel configs or undefined to use the passed config
         */
        afterBuild: function (gridConfig, model, config, initialPanelConfig) {},
        /**
         * @deprecated Always use the scaffold property on Ext.grid.Panel, this function will undergo some refactoring
         * Builds a grid config from a model definition, for scaffolding purposes.  
         * Guesses are made by model field configs and validation rules.
         *
         * @param {Ext.data.Model|String} model The model class or model name
         * @param {Object|False} config (optional) Any property of 
         * {@link Bancha.scaffold.Grid} can be overrided for this call by declaring 
         * it in this config. E.g
         *      {
         *          columnDefaults: {
         *              width: 200, // force a fixed with
         *          },
         *          onSave: function() {
         *              Ext.MessageBox.alert("Wohoo","You're pressed the save button :)");
         *          },
         *          formConfig: {
         *              textfieldDefaults: {
         *                  minLength: 3
         *              }
         *          }
         *      }
         *  
         * You can add editorfield configs to the property formConfig, which will then used as standard
         * {@link Bancha.scaffold.Form} properties for this call.
         * @param {Object} initialPanelConfig (optional) Some additional grid configs which are applied to the config.
         * @return {Object} Returns an Ext.grid.Panel configuration object
         */
        buildConfig: function (/* deprecated, is read from config.target */ignoredModel, config, initialPanelConfig) {
            var gridConfig, modelName, buttons, button, cellEditing, store, scope, listeners;
            config = Ext.apply({}, config, Ext.clone(this)); // get all defaults for this call

            // get the model name and model class
            config.target = Ext.isString(config.target) ? config.target : Ext.ClassManager.getName(config.target);            
            var model = Ext.ModelManager.getModel(config.target);

            // call beforeBuild callback
            gridConfig = config.beforeBuild(model, config, initialPanelConfig) || {};

            // basic config
            store = Bancha.scaffold.Util.getStore(model, config);
            listeners = {};
            Ext.apply(gridConfig, {
                store: store,
                columns: this.buildColumns(model, config, listeners),
                listeners: listeners // this is necessary for refreshing after associated stores are loaded
            });

            // add config for editable fields
            if (config.editable) {
                cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                });
                Ext.apply(gridConfig, {
                    selType: 'cellmodel',
                    plugins: [cellEditing]
                });
            }

            // replace button place holders and build bar
            if(config.buttons && config.buttons.length) {
                
                scope = {
                    getCellEditing: function() {
                        return cellEditing;
                    },
                    getStore: function() {
                        return store;
                    }
                };
                config.buttons = Bancha.scaffold.Util.replaceButtonPlaceHolders(config.buttons, config, scope);

                gridConfig.dockedItems = [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    items: config.buttons
                }];
            }

            // apply user configs
            if (Ext.isObject(initialPanelConfig)) {
                gridConfig = Ext.apply(gridConfig, initialPanelConfig);
            }

            // the scaffold config of the grid is saved as well
            gridConfig.scaffold = config;

            // return after interceptor
            return config.afterBuild(gridConfig, model, config, initialPanelConfig) || gridConfig;
        }
    },
    //eo Grid 

    /**
     * @class Bancha.scaffold.Form
     * @singleton
     * 
     * This class is a factory for creating Ext.form.Panel's. It uses many data from
     * the given model, including field configs and validation rules.  
     *    
     * In most cases you will use our configurations on {@link Ext.form.Panel}. The 
     * simplest usage is:
     *     Ext.create("Ext.form.Panel", {
     *         scaffold: 'MyApp.model.User', // the model name
     *     });
     * 
     * A more complex usage example:
     *     Ext.create("Ext.form.Panel", {
     *     
     *         scaffold: {
     *             // define the model name here
     *             target: 'MyApp.model.User',
     * 
     *             // you can tell the form to automatically load a record for edting, by id
     *             loadRecord: 3,
     *
     *             // define which buttons should be displayed
     *             buttons: ['reset','save'],
     *
     *             // advanced configs can be set here:
     *             textfieldDefaults: {
     *                 emptyText: 'Please fill this out'
     *             },
     *             datefieldDefaults: {
     *                 format: 'm/d/Y'
     *             },
     *             onSave: function() {
     *                 Ext.MessageBox.alert("Tada","You've pressed the form save button");
     *             }
     *         },
     *     
     *         // and add some styling
     *         height: 350,
     *         width: 650,
     *         frame:true,
     *         title: 'Form Panel',
     *         renderTo: 'formpanel',
     *         bodyStyle:'padding:5px 5px 0',
     *         fieldDefaults: {
     *             msgTarget: 'side',
     *             labelWidth: 75
     *         },
     *         defaults: {
     *             anchor: '100%'
     *         }
     *     });
     *
     * It currently creates fields for:  
     *  - string  
     *  - integer  
     *  - float (precision is read from metadata)  
     *  - boolean (checkboxes)  
     *  - date  
     * 
     * It's recognizing following validation rules on the model to add validations
     * to the form fields:  
     *  - format  
     *  - file  
     *  - length  
     *  - numberformat  
     *  - presence  
     *
     * You have three possible interceptors:  
     *  - beforeBuild         : executed before {@link #buildConfig}  
     *  - transformFieldConfig: executed after a field config is created, see {@link #transformFieldConfig}  
     *  - afterBuild          : executed after {@link #buildConfig} created the config  
     * 
     * @author Roland Schuetz <mail@rolandschuetz.at>
     * @docauthor Roland Schuetz <mail@rolandschuetz.at>
     */
    Form: {
        /**
         * @private
         * @property
         * Maps model field configs with field types and additional configs
         */
        fieldToFieldConfigs: {
            'auto': {
                xtype: 'textfield'
            },
            'string': {
                xtype: 'textfield'
            },
            'int': {
                xtype: 'numberfield',
                allowDecimals: false
            },
            'float': {
                xtype: 'numberfield'
            },
            'boolean': {
                xtype: 'checkboxfield'
            },
            'bool': {
                xtype: 'checkboxfield'
            },
            // a synonym
            'date': {
                xtype: 'datefield'
            }
            // TODO OPTIMIZE Add combobox support
        },
        /**
         * @property {String[]}
         * Exclude some model fields from scaffolding
         */
        exclude: [],
        /**
         * @property
         * This config is applied to each scaffolded form field
         */
        fieldDefaults: {},
        /**
         * @property
         * This config is applied to each scaffolded Ext.form.field.Date
         */
        datefieldDefaults: {},
        /**
         * @property
         * This config is applied to each scaffolded Ext.form.field.File
         */
        fileuploadfieldDefaults: {
            emptyText: 'Select an file'
        },
        /**
         * @property
         * This config is applied to each scaffolded Ext.form.field.Text
         */
        textfieldDefaults: {},
        /**
         * @property
         * This config is applied to each scaffolded Ext.form.field.Number
         */
        numberfieldDefaults: {},
        /**
         * @property
         * This config is applied to each scaffolded Ext.form.field.Checkbox
         */
        checkboxfieldDefaults: {
            uncheckedValue: false
        },
        /**
         * @property {Function} transformFieldConfig Writable function used to add some custom behaviour.
         *
         * This function can be overwritten by any custom function.
         * @param {Object} fieldConfig the field config to transform
         * @param {String} modelType A standard model field type like 'string' (also supports 'file' for compability with http://banchaproject.org)
         * @return {Object} Returns an Ext.form.field.* configuration object
         */
         transformFieldConfig: function (fieldConfig, modelType) {
            return fieldConfig;
         },
        /**
         * @private
         * @property {Function} internalTransformFieldConfig 
         * This function just hides id columns and makes it uneditable.
         * @param {Object} fieldConfig the field config to transform
         * @param {String} modelType A standard model field type like 'string' (also supports 'file' for compability with http://banchaproject.org)
         * @return {Object} Returns an Ext.form.field.* configuration object
         */
        internalTransformFieldConfig: function (fieldConfig, modelType) {
            if (fieldConfig.name === 'id') {
                fieldConfig.xtype = 'hiddenfield';
            }

            return fieldConfig;
        },
        /**
         * @private
         * Analysis the validation rules for a field and adds validation rules to the field config.
         * For what is supported see {@link Bancha.scaffold.Form}
         * @param {Object} field A Ext.form.field.* config
         * @param {Array} validations An array of Ext.data.validations of the model
         * @param {Object} config A Bancha.scaffold.Form config
         * @return {Object} Returns a Ext.form.field.* config
         */
        addValidationRuleConfigs: (function () {
            /*
             * closure these in so they are only created once.
             * we first create the regex and then get the string of them to not have to delete the backslashes 
             * have a bit cleaner code. It doesn't matter for performance cause it's done only once
             */
            var alpha = /^[a-zA-Z_]+$/.toString(),
                alphanum = /^[a-zA-Z0-9_]+$/.toString(),
                email = /^(\w+)([\-+.][\w]+)*@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/.toString(),
                url = /(((^https?)|(^ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i.toString();

            return function (field, validations, config) {
                var name = field.name, // it's used so often, make a shortcut
                    msgAddition;

                Ext.Array.forEach(validations, function (rule) {
                    if (rule.name !== name) {
                        return;
                    }
                    switch (rule.type) {
                    case 'presence':
                        field.allowBlank = false;
                        break;
                    case 'length':
                        // IFDEBUG
                        // length validation works only only on textfields
                        if (field.xtype !== 'textfield') {
                            msgAddition = (field.xtype === 'numberfield') ? 'Use the rule numberformat to force minimal and maximal values.' : '';
                            Ext.Error.raise({
                                plugin: 'Bancha.scaffold',
                                msg: 'Bancha Scaffold: The model has a validation rule length for the field ' + name + ', but this field is of type ' + field.xtype + ', so the rule makes no sense. ' + msgAddition
                            });
                        }
                        // ENDIF
                        if (field.xtype === 'textfield') {
                            if (Ext.isDefined(rule.min)) {
                                field.minLength = rule.min;
                            }
                            if (Ext.isDefined(rule.max)) {
                                field.maxLength = rule.max;
                            }
                        }
                        break;
                    case 'format':
                        // IFDEBUG
                        // length validation works only only on textfields
                        if (field.xtype !== 'textfield') {
                            Ext.Error.raise({
                                plugin: 'Bancha.scaffold',
                                msg: 'Bancha Scaffold: The model has a validation rule format for the field ' + name + ', but this field is of type ' + field.xtype + ', so the rule makes no sense.'
                            });
                        }
                        // ENDIF
                        switch (rule.matcher.toString()) {
                        case alpha:
                            field.vtype = 'alpha';
                            break;
                        case alphanum:
                            field.vtype = 'alphanum';
                            break;
                        case email:
                            field.vtype = 'email';
                            break;
                        case url:
                            field.vtype = 'url';
                            break;
                        default:
                            // IFDEBUG
                            if (window.console && Ext.isFunction(window.console.warn)) {
                                window.console.warn('Bancha Scaffold: Currently Bancha.scaffold.Form only recognizes the model Ext.data.validations format rules ' + 'with the matcher regex of Ext.form.field.VType alpha, alphanum, email and url. This rule with matcher ' + rule.matcher.toString() + ' will just be ignored.');
                            }
                            // ENDIF
                            break;
                        }
                        break;
                    case 'numberformat':
                        // numberformat validation works only only on numberfields
                        // IFDEBUG
                        if (field.xtype !== 'numberfield') {
                            Ext.Error.raise({
                                plugin: 'Bancha.scaffold',
                                msg: 'Bancha Scaffold: The model has a validation rule numberformat for the field ' + name + ', but this field is of type ' + field.xtype + ', so the rule makes no sense. A numberfield is expected.'
                            });
                        }
                        // ENDIF
                        if (field.xtype === 'numberfield') {
                            if (Ext.isDefined(rule.min)) {
                                field.minValue = rule.min;
                            }
                            if (Ext.isDefined(rule.max)) {
                                field.maxValue = rule.max;
                            }
                            if (Ext.isDefined(rule.precision)) {
                                field.decimalPrecision = rule.precision;
                            }
                        }
                        break;
                    case 'file':
                        // make the field a fileuploadfield
                        field.xtype = 'fileuploadfield';
                        Ext.apply(field, config.fileuploadfieldDefaults);

                        // add validation rules
                        if (Ext.isString(rule.extension)) {
                            rule.extension = [rule.extension];
                        }
                        if (Ext.isArray(rule.extension)) {
                            field.vtype = 'fileExtension';
                            field.validExtensions = rule.extension;
                        }
                        break;
                    default:
                        // IFDEBUG
                        if (window.console && Ext.isFunction(window.console.warn)) {
                            window.console.warn("Bancha Scaffold: Could not recognize rule " + Ext.encode(rule) + ' when trying to create a form field field.');
                        }
                        // ENDIF
                        break;
                    }
                    // TODO OPTIMIZE Also include inclusion and exclusion
                }); //eo forEach
                return field;
            }; //eo return fn
        }()),
        /**
         * @private
         * Builds a field with all defaults defined here
         * @param {Sring} type The model field type
         * @param {Object} defaults (optional) Defaults like textfieldDefaults as property of this config. 
         * See {@link #buildConfig}'s config property
         * @return {Object} Returns a Ext.form.field.* config
         */
        buildDefaultFieldFromModelType: function (type, defaults) {
            defaults = defaults || {};
            var field = Ext.clone(this.fieldToFieldConfigs[type]),
                fieldDefaults = Ext.clone(defaults.fieldDefaults || this.fieldDefaults),
                // make a new object of defaults
                fieldTypeDefaults = Ext.clone(defaults[field.xtype + 'Defaults'] || this[field.xtype + 'Defaults']);
            return Ext.apply(fieldDefaults, field, fieldTypeDefaults);
        },
        /**
         * @private
         * Creates a Ext.form.Field config from an model field type
         * @param {Sring} type The model's current field
         * @param {String} model the model
         * @param {Object} config A config object with all fields, see {@link #buildConfig}'s config property
         * @param {Array} validations (optional) An array of Ext.data.validations of the model
         * @param {Object} isEditorfield (optional) True to don't add field label (usefull e.g. in an editor grid)
         * @param {Object} nonEditorFieldModelField (optional) Dirty hack to set the fieldname on form panel creations, should be refactored!
         * @return {Object} Returns a field config
         */
        buildFieldConfig: function (modelField, model, config, validations, isEditorfield) {
            var type = modelField.type.type,
                field = this.buildDefaultFieldFromModelType(type, config),
                association,
                store,
                fieldName;

            // infer name
            field.name = modelField.name;
            if (!isEditorfield) {
                field.fieldLabel = Bancha.scaffold.Util.humanize(modelField.name);
            }

            // infer date format into editor (not needed for editor fields)
            if(type==='date' && !isEditorfield && modelField.dateFormat) {
                field.format = modelField.dateFormat;
            }

            // add some additional validation rules from model validation rules
            if (Ext.isDefined(validations) && validations.length) {
                field = this.addValidationRuleConfigs(field, validations, config);
            }

            // check for associations
            association = Bancha.scaffold.Util.getBelongsToAssociation(field, model);
            if(association) {
                Ext.apply(field, {
                    xtype: 'combobox',
                    store: Bancha.scaffold.Util.getStore(association.associatedModel, config),
                    displayField: Bancha.scaffold.Util.getDisplayFieldName(association.associatedModel),
                    valueField: association.associatedModel.prototype.idProperty || 'id',
                    queryMode: 'local'
                });
            }

            // now make custom transforms
            field = config.internalTransformFieldConfig(field,type);
            if (typeof config.transformFieldConfig === 'function') {
                field = config.transformFieldConfig(field, type);
            }

            // fileuploads are currently not supported in editor fields (ext doesn't render them usable)
            if (isEditorfield && field.xtype === 'fileuploadfield') {
                field = undefined; // TODO Maybe on double click open a modal window for file uploads
            }

            return field;
        },
        /**
         * @property
         * Editable function to be called when the save button is pressed.  
         * To change the default scaffolding behaviour just replace this function.  
         *   
         * The default scope provides two functions:  
         *  - this.getPanel() to get the form panel  
         *  - this.getForm() to get the basic form
         */
        onSave: function () {
            var form = this.getForm(),
                msg;
            if (form.isValid()) {
                msg = form.hasUpload() ? 'Uploading files...' : 'Saving data..';
                form.submit({
                    waitMsg: msg,
                    success: function (form, action) {
                        Ext.MessageBox.alert('Success', action.result.msg || 'Successfully saved data.');
                    },
                    failure: function (form, action) {
                        Ext.MessageBox.alert('Failed', action.result.msg || 'Could not save data, unknown error.');
                    }
                });
            }
        },
        /**
         * @property
         * Editable function to be called when the reset button is pressed.  
         * To change the default scaffolding behaviour just replace this function.  
         *   
         * The default scope provides two functions:  
         *  - this.getPanel() to get the form panel  
         *  - this.getForm() to get the basic form  
         */
        onReset: function () {
            this.getForm().reset();
        },
        /**
         * @property
         * If an array of elements, a footer toolbar is rendered.
         * reset' and 'save' will be replaced by scaffolded
         * buttons, other elements are treated like default ExtJS items.
         *    
         * Inside your own buttons you can set the scope property to
         * 'scaffold-scope-me', this scope provides two functions:  
         *  - this.getPanel() to get the form panel  
         *  - this.getForm() to get the basic form  
         *
         * Default: ['reset','save']
         */
        buttons: ['reset','save'],
        /**
         * @property
         * Default save button config, used in buttons.
         * If not defined scope and handler properties will be set by 
         * the build function.
         */
        saveButtonConfig: {
            iconCls: 'icon-save',
            text: 'Save',
            formBind: true
        },
        /**
         * @property
         * Default reset button config, used in buttons config.
         * If not defined scope and handler properties will be set by 
         * the build function.
         */
        resetButtonConfig: {
            iconCls: 'icon-reset',
            text: 'Reset'
        },
        /**
         * Build the form api config, used only by buildConfig()
         * just for separation of concern, since this is the only 
         * part which deals with proxies
         *
         * For Bancha projects with an CakePHP backend this function will
         * scaffold everything
         *
         * Otherwise it will use the initial config, if provided. If not, 
         * it will use the model proxies load method. There is no generic
         * way to guess the submit method, please either modify this function
         * or provide a propery form api config.
         *
         * @param {Ext.data.Model} model the model used for scaffolding
         * @param {Object} initialApi the initial Ext.form.Panel api config
         * @return the final Ext.form.Panel api config
         */
        buildApiConfig: function (model,initialApi) {

            if(Bancha.getModel) {
                // the user is using the full Bancha stack
                return this.buildBanchaApiConfig(model,initialApi);
            } else{

                if(initialApi) {
                    // just use the configured api
                    return initialApi;
                }
                
                // IFDEBUG
                // warn the user that we can just guess part of the api
                if (window.console && Ext.isFunction(window.console.warn)) {
                    window.console.warn([
                        'Bancha Scaffold: You have not defined any form api. If you want ',
                        'Bancha Scaffold to guess it, please define Bancha.scaffold.Form.',
                        'buildApiConfig. Bancha Scaffold can only try to get the load ',
                        'function from the model proxy, but not the submit function.'
                        ].join(''));
                }
                // ENDIF
            }

            // try to find the proxy configuration for load
            var proxy = model.getProxy(),
                load = proxy && proxy.api && proxy.api.read ? proxy.api.read :
                        (proxy && proxy.directFn ? proxy.directFn : undefined);

            return load ? {load: load} : undefined;
        },

        /**
         * @private
         * This function is used if you are using Bancha.scaffold.Form with 
         * the full Bancha library. It will automatically find all 
         * api configurations
         */
         buildBanchaApiConfig: function(model, initialApi) {
            initialApi = initialApi || {};

            // IFDEBUG
            if (!Bancha.initialized) {
                // the user is using Bancha, but hasn't initialized yet
                Ext.Error.raise({
                    plugin: 'Bancha.scaffold',
                    msg: 'Bancha Scaffold: Bancha is not yet initalized, please init before using Bancha.scaffold.Form.buildConfig().'
                });
            }
            // ENDIF

            var modelName = Ext.ClassManager.getName(model),
                stubName = modelName.substr(Bancha.modelNamespace.length + 1),
                stub = Bancha.getStubsNamespace()[stubName];

            // IFDEBUG
            if (!Ext.isDefined(stub)) {
                Ext.Error.raise({
                    plugin: 'Bancha.scaffold',
                    msg: 'Bancha Scaffold: Bancha.scaffold.Form.buildConfig() expects an remotable bancha model, but got an "normal" model or something else'
                });
            }
            // ENDIF

            return {
                // The server-side method to call for load() requests
                load: initialApi.read || stub.read,
                // as first and only param you must add data: {id: id} when loading
                // The server-side must mark the submit handler as a 'formHandler'
                submit: initialApi.submit || stub.submit
            };
        },
        /**
         * You only need this is you're adding additional buttoms to the form inside the
         * afterBuild function.  
         * Since the form panel doesn't give us an useful scope to get the form panel,
         * this function will create an proper scope. The scope provides two functions:  
         *  - this.getPanel() to get the form panel  
         *  - this.getForm() to get the basic form  
         * 
         * @param {Function} handler A button handler function to apply the scope to
         * @param {Number|String} id The form panel id
         */
        buildButtonScope: (function () {
            var scopePrototype = {
                getPanel: function () {
                    return this.panel || Ext.ComponentManager.get(this.id);
                },
                getForm: function () {
                    return this.form || this.getPanel().getForm();
                }
            };

            return function (id) {
                return Ext.apply({
                    id: id
                }, scopePrototype);
            };
        }()),
        /**
         * @property {String|Number|False}
         * Define a record id here to autolaod this record for editing in this form, or choose
         * false to create a new record onSave. You can also overwrite onSave to define your
         * own behavior
         * (Default: false)
         */
        loadRecord: false,
        /**
         * You can replace this function! The function will be executed before each 
         * {@link #buildConfig} as interceptor. 
         * @param {Ext.data.Model} model the model used for scaffolding
         * @param {Object} config the scaffold full config for this call
         * @param {Object} initialPanelConfig see {@link #buildConfig}'s initialPanelConfig property
         * @return {Object|undefined} object with initial Ext.form.Panel configs
         */
        beforeBuild: function (model, config, initialPanelConfig) {},
        /**
         * You can replace this function! This function will be executed after each 
         * {@link #buildConfig} as interceptor
         * @param {Object} formConfig the just build form panel config
         * @param {Ext.data.Model} model the model used for scaffolding
         * @param {Object} config the scaffold full config for this call
         * @param {Object} initialPanelConfig see {@link #buildConfig}'s initialPanelConfig property
         * @return {Object|Undefined} object with final Ext.form.Panel configs or undefined to use the passed config
         */
        afterBuild: function (formConfig, model, config, initialPanelConfig) {},
        /**
         * @deprecated Always use the scaffold property on Ext.form.Panel, this function will undergo some refactoring
         * Builds form configs from the metadata, for scaffolding purposes.  
         * By default data is loaded from the server if an id is supplied and 
         * onSave it pushed the data to the server.  
         *  
         * Guesses are made by model field configs and validation rules. 
         * @param {Ext.data.Model|String} model the model class or model name
         * data from server, false to don't load anything (for creating new rows)
         * @param {Object|False} config (optional) Any property of 
         * {@link Bancha.scaffold.Form} can be overrided for this call by declaring it 
         * here. E.g.:
         *      {
         *          fieldDefaults: {
         *              disabled: true; // disable all fields by default
         *          },
         *          onSave: function() {
         *              Ext.MessageBox.alert("Wohoo","You're pressed the save button :)");
         *          }
         *      }
         *
         * If you don't define an id here it will be created and can not be changed anymore afterwards.
         *
         * @param {Object} initialPanelConfig (optional) Some additional Ext.form.Panel
         * configs which are applied to the config
         * @return {Object} object with Ext.form.Panel configs
         */
        buildConfig: function (/* deprecated, is read from config.target */ignoredModel, config, initialPanelConfig) {
            var fields = [],
                formConfig, id, validations, loadFn;
            config = Ext.apply({}, config, Ext.clone(this)); // get all defaults for this call
            initialPanelConfig = initialPanelConfig || {};

            // get the model name and model class
            config.target = Ext.isString(config.target) ? config.target : Ext.ClassManager.getName(config.target);            
            var model = Ext.ModelManager.getModel(config.target);

            if(!Ext.isArray(config.exclude)) {
                // IFDEBUG
                Ext.Error.raise({
                    plugin: 'Bancha.scaffold',
                    model: model,
                    msg: 'Bancha Scaffold: When scaffolding a form panel the exclude property should be an array of field names to exclude.'
                });
                // ENDIF
                config.exclude = [];
            }

            // build initial config
            formConfig = config.beforeBuild(model, config, initialPanelConfig) || {};

            // create all fields
            validations = model.prototype.validations;
            model.prototype.fields.each(function (field) {
                if(config.exclude.indexOf(field.name) === -1) {
                    fields.push(
                        Bancha.scaffold.Form.buildFieldConfig(field, model, config, validations));
                }
            });

            // probably not neccessary in extjs4!
            // if one of the fields is a fileupload, mark the form
            Ext.each(fields, function (field) {
                if (field.xtype === 'fileuploadfield') {
                    formConfig.isUpload = true;
                    formConfig.fileUpload = true;
                    return false;
                }
                return true;
            });

            // for scoping reason we have to force an id here
            id = initialPanelConfig.id || Ext.id(null, 'formpanel-');
            formConfig.id = id;

            // build buttons
            config.buttons = Bancha.scaffold.Util.replaceButtonPlaceHolders(config.buttons || [], 
                                                        config, this.buildButtonScope(id));

            // extend formConfig
            Ext.apply(formConfig, initialPanelConfig, {
                id: id,
                api: this.buildApiConfig(model,initialPanelConfig.api),
                paramOrder: ['data'],
                items: fields,
                buttons: config.buttons
            });

            // the scaffold config of the grid is saved as well
            formConfig.scaffold = config;

            // autoload the record
            if (Ext.isDefined(config.loadRecord) && config.loadRecord !== false) {
                // load the record on component load
                loadFn = function (component, options) {
                    component.load({
                        params: {
                            data: {
                                data: {
                                    id: config.loadRecord
                                }
                            } // bancha expects it this way
                        }
                    });
                };
                // if there's already a function, batch them
                formConfig.listeners = formConfig.listeners || {};
                if (formConfig.listeners.afterrender) {
                    formConfig.listeners.afterrender = Ext.Function.createSequence(formConfig.listeners.afterrender, loadFn);
                } else {
                    formConfig.listeners.afterrender = loadFn;
                }
            }

            // return after interceptor
            return config.afterBuild(formConfig, model, config, initialPanelConfig) || formConfig;
        }
    } //eo Form
}); //eo scaffold

// eof
