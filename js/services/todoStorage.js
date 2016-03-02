/*global angular */

/**
 * Services that persists and retrieves todos from a local browser cache
 * or a backend API if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc')
	.factory('store', function ($injector, USE_API) {
		'use strict';

    // Read USE_API constant to determine whether to use the API
    // API methods or the browser storage methods. Each service 
    // has the same API so our Controller code won't need to change
    // whether we use the local browser to store Todos or if we 
    // use an API
    if (USE_API) {
      return $injector.get('api');
    } else {
      return $injector.get('browserStorage');
    }
	})

	.factory('api', function ($resource) {
		'use strict';

		var store = {
			todos: [],

			api: $resource('/api/todos/:id', null,
				{
					update: { method:'PUT' }
				}
			),

			clearCompleted: function () {
				var originalTodos = store.todos.slice(0);

				var incompleteTodos = store.todos.filter(function (todo) {
					return !todo.completed;
				});

				angular.copy(incompleteTodos, store.todos);

				return store.api.delete(function () {
					}, function error() {
						angular.copy(originalTodos, store.todos);
					});
			},

			delete: function (todo) {
				var originalTodos = store.todos.slice(0);

				store.todos.splice(store.todos.indexOf(todo), 1);
				return store.api.delete({ id: todo.id },
					function () {
					}, function error() {
						angular.copy(originalTodos, store.todos);
					});
			},

			get: function () {
				return store.api.query(function (resp) {
					angular.copy(resp, store.todos);
				});
			},

			insert: function (todo) {
				var originalTodos = store.todos.slice(0);

				return store.api.save(todo,
					function success(resp) {
						todo.id = resp.id;
						store.todos.push(todo);
					}, function error() {
						angular.copy(originalTodos, store.todos);
					})
					.$promise;
			},

			put: function (todo) {
				return store.api.update({ id: todo.id }, todo)
					.$promise;
			}
		};

		return store;
	})

	.factory('browserStorage', function ($q) {
		'use strict';

		var store = {
			todos: [],

			clearCompleted: function () {
        
        return $q(function (resolve, reject) {
          // Find incomplete todos
          var incompleteTodos = store.todos.filter(function (todo) {
            return !todo.completed;
          });

          
          angular.copy(incompleteTodos, store.todos);
          
          resolve(store.todos);
        });
			},

			delete: function (todo) {
				return $q(function (resolve, reject) {
          store.todos.splice(store.todos.indexOf(todo), 1);
          resolve(store.todos);
        });
			},

			get: function () {
				return $q(function (resolve, reject) {
          resolve(store.todos);
        })
			},

			insert: function (todo) {
				return $q(function (resolve, reject) {
          store.todos.push(todo);

				  resolve(store.todos);
        })
			},

			put: function (todo, index) {
        return $q(function (resolve, reject) {
          store.todos[index] = todo;

          resolve(store.todos);  
        });
			}
		};

		return store;
	});