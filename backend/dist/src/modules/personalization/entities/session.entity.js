'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SessionEntity = void 0;
const typeorm_1 = require('typeorm');
const session_interaction_entity_1 = require('./session-interaction.entity');
let SessionEntity = class SessionEntity {};
exports.SessionEntity = SessionEntity;
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)('uuid'), __metadata('design:type', String)],
  SessionEntity.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ unique: true }), __metadata('design:type', String)],
  SessionEntity.prototype,
  'sessionId',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'timestamp' }), __metadata('design:type', Date)],
  SessionEntity.prototype,
  'startTime',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'timestamp' }), __metadata('design:type', Date)],
  SessionEntity.prototype,
  'lastActivityTime',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true }), __metadata('design:type', Object)],
  SessionEntity.prototype,
  'deviceInfo',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  SessionEntity.prototype,
  'referrer',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'jsonb', default: [] }), __metadata('design:type', Array)],
  SessionEntity.prototype,
  'searchQueries',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'jsonb', default: [] }), __metadata('design:type', Array)],
  SessionEntity.prototype,
  'clickedResults',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'jsonb', default: [] }), __metadata('design:type', Array)],
  SessionEntity.prototype,
  'viewedCategories',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'jsonb', default: [] }), __metadata('design:type', Array)],
  SessionEntity.prototype,
  'viewedBrands',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'jsonb', default: [] }), __metadata('design:type', Array)],
  SessionEntity.prototype,
  'filters',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  SessionEntity.prototype,
  'userId',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  SessionEntity.prototype,
  'anonymousUserId',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'integer', nullable: true }), __metadata('design:type', Number)],
  SessionEntity.prototype,
  'duration',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => session_interaction_entity_1.SessionInteractionEntity,
      interaction => interaction.session,
      { eager: false },
    ),
    __metadata('design:type', Array),
  ],
  SessionEntity.prototype,
  'interactions',
  void 0,
);
__decorate(
  [(0, typeorm_1.CreateDateColumn)(), __metadata('design:type', Date)],
  SessionEntity.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.UpdateDateColumn)(), __metadata('design:type', Date)],
  SessionEntity.prototype,
  'updatedAt',
  void 0,
);
exports.SessionEntity = SessionEntity = __decorate(
  [(0, typeorm_1.Entity)('sessions')],
  SessionEntity,
);
//# sourceMappingURL=session.entity.js.map
