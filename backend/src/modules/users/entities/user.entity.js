'use strict';
var __runInitializers =
  (this && this.__runInitializers) ||
  function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
var __esDecorate =
  (this && this.__esDecorate) ||
  function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected');
      return f;
    }
    var kind = contextIn.kind,
      key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
    var target = !descriptorIn && ctor ? (contextIn['static'] ? ctor : ctor.prototype) : null;
    var descriptor =
      descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _,
      done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === 'access' ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) {
        if (done) throw new TypeError('Cannot add initializers after decoration has completed');
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(
        kind === 'accessor' ? { get: descriptor.get, set: descriptor.set } : descriptor[key],
        context,
      );
      if (kind === 'accessor') {
        if (result === void 0) continue;
        if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
        if ((_ = accept(result.get))) descriptor.get = _;
        if ((_ = accept(result.set))) descriptor.set = _;
        if ((_ = accept(result.init))) initializers.unshift(_);
      } else if ((_ = accept(result))) {
        if (kind === 'field') initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
    return Object.defineProperty(f, 'name', {
      configurable: true,
      value: prefix ? ''.concat(prefix, ' ', name) : name,
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.User = exports.UserRole = void 0;
var typeorm_1 = require('typeorm');
var graphql_1 = require('@nestjs/graphql');
var class_transformer_1 = require('class-transformer');
// Define the UserRole enum
var UserRole;
(function (UserRole) {
  UserRole['USER'] = 'USER';
  UserRole['MERCHANT'] = 'MERCHANT';
  UserRole['ADMIN'] = 'ADMIN';
})(UserRole || (exports.UserRole = UserRole = {}));
// Register the enum with GraphQL
(0, graphql_1.registerEnumType)(UserRole, {
  name: 'UserRole',
  description: 'Defines the roles a user can have',
});
var User = (function () {
  var _classDecorators = [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('users')];
  var _classDescriptor;
  var _classExtraInitializers = [];
  var _classThis;
  var _instanceExtraInitializers = [];
  var _id_decorators;
  var _id_initializers = [];
  var _id_extraInitializers = [];
  var _email_decorators;
  var _email_initializers = [];
  var _email_extraInitializers = [];
  var _firstName_decorators;
  var _firstName_initializers = [];
  var _firstName_extraInitializers = [];
  var _lastName_decorators;
  var _lastName_initializers = [];
  var _lastName_extraInitializers = [];
  var _password_decorators;
  var _password_initializers = [];
  var _password_extraInitializers = [];
  var _role_decorators;
  var _role_initializers = [];
  var _role_extraInitializers = [];
  var _profileImage_decorators;
  var _profileImage_initializers = [];
  var _profileImage_extraInitializers = [];
  var _interests_decorators;
  var _interests_initializers = [];
  var _interests_extraInitializers = [];
  var _isEmailVerified_decorators;
  var _isEmailVerified_initializers = [];
  var _isEmailVerified_extraInitializers = [];
  var _isMerchant_decorators;
  var _isMerchant_initializers = [];
  var _isMerchant_extraInitializers = [];
  var _createdAt_decorators;
  var _createdAt_initializers = [];
  var _createdAt_extraInitializers = [];
  var _updatedAt_decorators;
  var _updatedAt_initializers = [];
  var _updatedAt_extraInitializers = [];
  var _get_fullName_decorators;
  var User = (_classThis = /** @class */ (function () {
    function User_1() {
      this.id =
        (__runInitializers(this, _instanceExtraInitializers),
        __runInitializers(this, _id_initializers, void 0));
      this.email =
        (__runInitializers(this, _id_extraInitializers),
        __runInitializers(this, _email_initializers, void 0));
      this.firstName =
        (__runInitializers(this, _email_extraInitializers),
        __runInitializers(this, _firstName_initializers, void 0));
      this.lastName =
        (__runInitializers(this, _firstName_extraInitializers),
        __runInitializers(this, _lastName_initializers, void 0));
      this.password =
        (__runInitializers(this, _lastName_extraInitializers),
        __runInitializers(this, _password_initializers, void 0));
      this.role =
        (__runInitializers(this, _password_extraInitializers),
        __runInitializers(this, _role_initializers, void 0));
      this.profileImage =
        (__runInitializers(this, _role_extraInitializers),
        __runInitializers(this, _profileImage_initializers, void 0));
      this.interests =
        (__runInitializers(this, _profileImage_extraInitializers),
        __runInitializers(this, _interests_initializers, void 0));
      this.isEmailVerified =
        (__runInitializers(this, _interests_extraInitializers),
        __runInitializers(this, _isEmailVerified_initializers, void 0));
      this.isMerchant =
        (__runInitializers(this, _isEmailVerified_extraInitializers),
        __runInitializers(this, _isMerchant_initializers, void 0));
      this.createdAt =
        (__runInitializers(this, _isMerchant_extraInitializers),
        __runInitializers(this, _createdAt_initializers, void 0));
      this.updatedAt =
        (__runInitializers(this, _createdAt_extraInitializers),
        __runInitializers(this, _updatedAt_initializers, void 0));
      __runInitializers(this, _updatedAt_extraInitializers);
    }
    Object.defineProperty(User_1.prototype, 'fullName', {
      // Virtual field for full name
      get: function () {
        return ''.concat(this.firstName, ' ').concat(this.lastName);
      },
      enumerable: false,
      configurable: true,
    });
    return User_1;
  })());
  __setFunctionName(_classThis, 'User');
  (function () {
    var _metadata = typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
    _id_decorators = [
      (0, graphql_1.Field)(function () {
        return graphql_1.ID;
      }),
      (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    ];
    _email_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)({ unique: true })];
    _firstName_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)()];
    _lastName_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)()];
    _password_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.Column)()];
    _role_decorators = [
      (0, graphql_1.Field)(function () {
        return UserRole;
      }),
      (0, typeorm_1.Column)({ type: 'enum', enum: UserRole, default: UserRole.USER }),
    ];
    _profileImage_decorators = [
      (0, graphql_1.Field)({ nullable: true }),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _interests_decorators = [
      (0, graphql_1.Field)(
        function () {
          return [String];
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)('simple-array', { nullable: true }),
    ];
    _isEmailVerified_decorators = [
      (0, graphql_1.Field)(
        function () {
          return Boolean;
        },
        { defaultValue: false },
      ),
      (0, typeorm_1.Column)({ default: false }),
    ];
    _isMerchant_decorators = [
      (0, graphql_1.Field)(
        function () {
          return Boolean;
        },
        { defaultValue: false },
      ),
      (0, typeorm_1.Column)({ default: false }),
    ];
    _createdAt_decorators = [
      (0, graphql_1.Field)(function () {
        return graphql_1.GraphQLISODateTime;
      }),
      (0, typeorm_1.CreateDateColumn)(),
    ];
    _updatedAt_decorators = [
      (0, graphql_1.Field)(function () {
        return graphql_1.GraphQLISODateTime;
      }),
      (0, typeorm_1.UpdateDateColumn)(),
    ];
    _get_fullName_decorators = [(0, graphql_1.Field)()];
    __esDecorate(
      _classThis,
      null,
      _get_fullName_decorators,
      {
        kind: 'getter',
        name: 'fullName',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'fullName' in obj;
          },
          get: function (obj) {
            return obj.fullName;
          },
        },
        metadata: _metadata,
      },
      null,
      _instanceExtraInitializers,
    );
    __esDecorate(
      null,
      null,
      _id_decorators,
      {
        kind: 'field',
        name: 'id',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'id' in obj;
          },
          get: function (obj) {
            return obj.id;
          },
          set: function (obj, value) {
            obj.id = value;
          },
        },
        metadata: _metadata,
      },
      _id_initializers,
      _id_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _email_decorators,
      {
        kind: 'field',
        name: 'email',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'email' in obj;
          },
          get: function (obj) {
            return obj.email;
          },
          set: function (obj, value) {
            obj.email = value;
          },
        },
        metadata: _metadata,
      },
      _email_initializers,
      _email_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _firstName_decorators,
      {
        kind: 'field',
        name: 'firstName',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'firstName' in obj;
          },
          get: function (obj) {
            return obj.firstName;
          },
          set: function (obj, value) {
            obj.firstName = value;
          },
        },
        metadata: _metadata,
      },
      _firstName_initializers,
      _firstName_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _lastName_decorators,
      {
        kind: 'field',
        name: 'lastName',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'lastName' in obj;
          },
          get: function (obj) {
            return obj.lastName;
          },
          set: function (obj, value) {
            obj.lastName = value;
          },
        },
        metadata: _metadata,
      },
      _lastName_initializers,
      _lastName_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _password_decorators,
      {
        kind: 'field',
        name: 'password',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'password' in obj;
          },
          get: function (obj) {
            return obj.password;
          },
          set: function (obj, value) {
            obj.password = value;
          },
        },
        metadata: _metadata,
      },
      _password_initializers,
      _password_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _role_decorators,
      {
        kind: 'field',
        name: 'role',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'role' in obj;
          },
          get: function (obj) {
            return obj.role;
          },
          set: function (obj, value) {
            obj.role = value;
          },
        },
        metadata: _metadata,
      },
      _role_initializers,
      _role_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _profileImage_decorators,
      {
        kind: 'field',
        name: 'profileImage',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'profileImage' in obj;
          },
          get: function (obj) {
            return obj.profileImage;
          },
          set: function (obj, value) {
            obj.profileImage = value;
          },
        },
        metadata: _metadata,
      },
      _profileImage_initializers,
      _profileImage_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _interests_decorators,
      {
        kind: 'field',
        name: 'interests',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'interests' in obj;
          },
          get: function (obj) {
            return obj.interests;
          },
          set: function (obj, value) {
            obj.interests = value;
          },
        },
        metadata: _metadata,
      },
      _interests_initializers,
      _interests_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _isEmailVerified_decorators,
      {
        kind: 'field',
        name: 'isEmailVerified',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'isEmailVerified' in obj;
          },
          get: function (obj) {
            return obj.isEmailVerified;
          },
          set: function (obj, value) {
            obj.isEmailVerified = value;
          },
        },
        metadata: _metadata,
      },
      _isEmailVerified_initializers,
      _isEmailVerified_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _isMerchant_decorators,
      {
        kind: 'field',
        name: 'isMerchant',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'isMerchant' in obj;
          },
          get: function (obj) {
            return obj.isMerchant;
          },
          set: function (obj, value) {
            obj.isMerchant = value;
          },
        },
        metadata: _metadata,
      },
      _isMerchant_initializers,
      _isMerchant_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _createdAt_decorators,
      {
        kind: 'field',
        name: 'createdAt',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'createdAt' in obj;
          },
          get: function (obj) {
            return obj.createdAt;
          },
          set: function (obj, value) {
            obj.createdAt = value;
          },
        },
        metadata: _metadata,
      },
      _createdAt_initializers,
      _createdAt_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _updatedAt_decorators,
      {
        kind: 'field',
        name: 'updatedAt',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'updatedAt' in obj;
          },
          get: function (obj) {
            return obj.updatedAt;
          },
          set: function (obj, value) {
            obj.updatedAt = value;
          },
        },
        metadata: _metadata,
      },
      _updatedAt_initializers,
      _updatedAt_extraInitializers,
    );
    __esDecorate(
      null,
      (_classDescriptor = { value: _classThis }),
      _classDecorators,
      { kind: 'class', name: _classThis.name, metadata: _metadata },
      null,
      _classExtraInitializers,
    );
    User = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (User = _classThis);
})();
exports.User = User;
