const { sequelize } = require('../config/database');
const User = require('./User');
const Competition = require('./Competition');
const Stage = require('./Stage');
const Team = require('./Team');
const TeamMember = require('./TeamMember');
const QualificationQuestion = require('./QualificationQuestion');
const QualificationAnswer = require('./QualificationAnswer');
const Judge = require('./Judge');
const Score = require('./Score');
const UploadedFile = require('./UploadedFile');
const Sponsor = require('./Sponsor');
const Message = require('./Message');
const Room = require('./Room');

// Define associations
User.hasMany(Competition, { foreignKey: 'created_by', as: 'createdCompetitions' });
Competition.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Competition.hasMany(Stage, { foreignKey: 'competition_id', as: 'stages' });
Stage.belongsTo(Competition, { foreignKey: 'competition_id', as: 'competition' });

Competition.hasMany(Team, { foreignKey: 'competition_id', as: 'teams' });
Team.belongsTo(Competition, { foreignKey: 'competition_id', as: 'competition' });

User.hasOne(Team, { foreignKey: 'leader_id', as: 'ledTeam' });
Team.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });

Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(TeamMember, { foreignKey: 'user_id', as: 'teamMemberships' });

Competition.hasMany(QualificationQuestion, { foreignKey: 'competition_id', as: 'qualificationQuestions' });
QualificationQuestion.belongsTo(Competition, { foreignKey: 'competition_id', as: 'competition' });

QualificationQuestion.hasMany(QualificationAnswer, { foreignKey: 'question_id', as: 'answers' });
QualificationAnswer.belongsTo(QualificationQuestion, { foreignKey: 'question_id', as: 'question' });
QualificationAnswer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(QualificationAnswer, { foreignKey: 'user_id', as: 'qualificationAnswers' });

Competition.hasMany(Judge, { foreignKey: 'competition_id', as: 'judges' });
Judge.belongsTo(Competition, { foreignKey: 'competition_id', as: 'competition' });
Judge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Judge, { foreignKey: 'user_id', as: 'judgeAssignments' });

Competition.hasMany(Score, { foreignKey: 'competition_id', as: 'scores' });
Score.belongsTo(Competition, { foreignKey: 'competition_id', as: 'competition' });
Score.belongsTo(Stage, { foreignKey: 'stage_id', as: 'stage' });
Score.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Score.belongsTo(User, { foreignKey: 'judge_id', as: 'judge' });

Team.hasMany(UploadedFile, { foreignKey: 'team_id', as: 'files' });
UploadedFile.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
UploadedFile.belongsTo(User, { foreignKey: 'user_id', as: 'uploader' });

Competition.hasMany(Sponsor, { foreignKey: 'competition_id', as: 'sponsors' });
Sponsor.belongsTo(Competition, { foreignKey: 'competition_id', as: 'competition' });

Team.hasOne(Room, { foreignKey: 'team_id', as: 'room' });
Room.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

Room.hasMany(Message, { foreignKey: 'room_id', as: 'messages' });
Message.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' });

module.exports = {
  sequelize,
  User,
  Competition,
  Stage,
  Team,
  TeamMember,
  QualificationQuestion,
  QualificationAnswer,
  Judge,
  Score,
  UploadedFile,
  Sponsor,
  Message,
  Room
};

