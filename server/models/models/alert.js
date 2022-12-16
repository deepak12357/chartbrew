const simplecrypt = require("simplecrypt");

const settings = process.env.NODE_ENV === "production" ? require("../../settings") : require("../../settings-dev");

const sc = simplecrypt({
  password: settings.secret,
  salt: "10",
});

module.exports = (sequelize, DataTypes) => {
  const Alert = sequelize.define("Alert", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      reference: {
        model: "Chart",
        key: "id",
        onDelete: "cascade",
      },
    },
    dataset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      reference: {
        model: "Dataset",
        key: "id",
        onDelete: "cascade",
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rules: {
      type: DataTypes.TEXT("long"),
      set(val) {
        return this.setDataValue("rules", sc.encrypt(JSON.stringify(val)));
      },
      get() {
        try {
          return JSON.parse(sc.decrypt(this.getDataValue("rules")));
        } catch (e) {
          return this.getDataValue("rules");
        }
      }
    },
    recipients: {
      type: DataTypes.TEXT,
      set(val) {
        return this.setDataValue("recipients", sc.encrypt(JSON.stringify(val)));
      },
      get() {
        try {
          return JSON.parse(sc.decrypt(this.getDataValue("recipients")));
        } catch (e) {
          return this.getDataValue("recipients");
        }
      },
    },
    mediums: {
      type: DataTypes.TEXT,
      set(val) {
        return this.setDataValue("mediums", sc.encrypt(JSON.stringify(val)));
      },
      get() {
        try {
          return JSON.parse(sc.decrypt(this.getDataValue("mediums")));
        } catch (e) {
          return this.getDataValue("mediums");
        }
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
  }, {
    freezeTableName: true,
  });

  Alert.associate = (models) => {
    models.Alert.belongsTo(models.Dataset, { foreignKey: "dataset_id" });
    models.Alert.belongsTo(models.Chart, { foreignKey: "chart_id" });
  };

  return Alert;
};