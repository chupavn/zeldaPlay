const Character = require('../db/models/character_schema');
const DatabaseError = require('../utils/ErrorObjects').DatabaseError;

const characterServices = {};

characterServices.getAll = getAll;
characterServices.getOne = getOne;
characterServices.updateOne = updateOne;
characterServices.getUserCharacters = getUserCharacters;
characterServices.newWeapon = newWeapon;

module.exports = characterServices;

function getAll() {
  return new Promise((resolve, reject) => {
    resolve(
      Character.query()
        .select('id', 'name', 'race')
        .whereNull('user_id')
    );
  })
    .then((characters) => {
      if (characters.length === 0) {
        throw new DatabaseError('No characters found!', 'NO_CHAR');
      }
      return characters;
    })
    .catch((err) => {
      if (!(err instanceof DatabaseError)) {
        err = new DatabaseError(err.message, 'DB_ERROR');
      }
      throw err;
    });
}

function getOne(id) {
  return new Promise((resolve, reject) => {
    console.log(id);
    Character.query()
      .findById(id)
      .then((character) => {
        if (!character) {
          reject(new DatabaseError('No character found', 'NO_CHAR'));
        }
        return Promise.all([
          Promise.resolve(character),
          character.$relatedQuery('skills').orderBy('name'),
          character
            .$relatedQuery('weapons')
            .eager('element')
            .orderBy('name'),
          character.$relatedQuery('spells').orderBy('diety'),
          character.$relatedQuery('saves').orderBy('name'),
          character.$relatedQuery('notes').orderBy('time')
        ]);
      })
      .then((character) => {
        resolve(character[0]);
      })
      .catch((err) => {
        if (!(err instanceof DatabaseError)) {
          err = new DatabaseError(err.message, 'DB_ERROR');
        }
        throw err;
      });
  });
}

function updateOne(id, body) {
  return new Promise((resolve, reject) => {
    const character = {
      name: body.name,
      strength: body.attributes[0].value,
      dexterity: body.attributes[1].value,
      constitution: body.attributes[2].value,
      intelligence: body.attributes[3].value,
      wisdom: body.attributes[4].value,
      charisma: body.attributes[5].value,
      max_health: body.maxHealth,
      health: body.health,
      max_magic: body.maxMagic,
      magic: body.magic,
      experience: body.exp,
      race: body.race,
      level: body.level,
      subrace: checkNull(body.subrace),
      ac: checkNull(body.ac),
      flat_footed: checkNull(body.flat_footed),
      touch: checkNull(body.touch),
      size: checkNull(body.size),
      craft_one: checkNull(body.craftOne),
      craft_two: checkNull(body.craftTwo),
      performance: checkNull(body.performCust),
      profession: checkNull(body.profession),
      last_modified_by: id,
      user_id: id,
      id: checkNull(body.id)
    };
    resolve(Character.query().upsert(character));
  })
    .then((charId) => {
      console.log(charId);
      const chId = charId.id;
      const skills = [];
      const spells = [];
      const weapons = [];
      const notes = [];
      const saves = [];
      body.skills.forEach((skill) => {
        skills.push({
          character_id: chId,
          trained: skill.trained,
          name: skill.skillName,
          ranks: skill.ranks,
          modifier: skill.modifier,
          racial_modifier: skill.racial,
          item_modifier: skill.item,
          skill_type: 'skill',
          misc_modifier: skill.misc,
          last_modified_by: id,
          id: checkNull(skill.id)
        });
      });
      body.weaponSkills.forEach((wSkill) => {
        skills.push({
          character_id: chId,
          last_modified_by: id,
          skill_type: 'weapon',
          name: wSkill.skillName,
          trained: wSkill.trained,
          ranks: wSkill.ranks,
          racial_modifier: wSkill.racial,
          id: checkNull(wSkill.id)
        });
      });
      body.magicSkills.forEach((mSkill) => {
        skills.push({
          character_id: chId,
          last_modified_by: id,
          skill_type: 'magic',
          modifier: mSkill.modifier,
          name: mSkill.skillName,
          ranks: mSkill.ranks,
          id: checkNull(mSkill.id)
        });
      });
      body.weapons.forEach((weapon) => {
        weapons.push({
          character_id: chId,
          last_modified_by: id,
          damage: weapon.attack,
          number_of_hits: weapon.numberOfAttacks,
          crit_range: parseArray(weapon.critRange),
          crit_multiplier: weapon.critDamage,
          type: weapon.type,
          modifier: weapon.modifier,
          range: checkNull(weapon.range),
          ammo: checkNull(weapon.ammo),
          element: checkNull(weapon.element),
          id: checkNull(weapon.id)
        });
      });
      body.spells.forEach((spell) => {
        spells.push({
          character_id: chId,
          last_modified_by: id,
          name: spell.name,
          effect: spell.effect,
          mp_use: spell.mpUse,
          damage: spell.damage,
          number_of_hit: spell.multiplier,
          modifier: checkNull(spell.modifier),
          diety: spell.diety,
          use_diety: spell.useDiety,
          id: checkNull(spell.id)
        });
      });
      body.notes.forEach((note) => {
        notes.push({
          character_id: chId,
          last_modified_by: id,
          message: note.msg,
          time: note.time,
          important: note.important,
          id: checkNull(note.id)
        });
      });
      body.savingThrows.forEach((save) => {
        saves.push({
          character_id: chId,
          last_modified_by: id,
          racial_bonus: save.racial,
          name: save.name,
          modifier: save.modifier,
          id: checkNull(save.id)
        });
      });
      const promises = [];
      promises.push(Promise.resolve(charId));
      skills.forEach(skill => {
        promises.push(charId.$relatedQuery('skills').upsert(skill));
      });
      weapons.forEach(weapon => {
        promises.push(charId.$relatedQuery('weapons').upsert(weapon));
      });
      saves.forEach(save => {
        promises.push(charId.$relatedQuery('saves').upsert(save));
      });
      spells.forEach(spell => {
        promises.push(charId.$relatedQuery('spells').upsert(spell));
      });
      notes.forEach(note => {
        promises.push(charId.$relatedQuery('notes').upsert(note)); 
      });
      return Promise.all(promises);
    })
    .then((results) => {
      return results[0];
    })
    .catch((err) => {
      if (!(err instanceof DatabaseError)) {
        newErr = new DatabaseError(err.message, 'DB_ERROR');
        newErr.stack = err.stack;
        err = newErr;
      }
      throw err;
    });
}

function getUserCharacters(userId) {
  return new Promise((resolve, reject) => {
    if (!userId.startsWith('00U') && userId.length !== 12) {
      reject(new DatabaseError('Bad user id.', 'BAD_USER'));
    }
    resolve(Character.query().where({ user_id: userId }));
  }).catch((err) => {
    if (!(err instanceof DatabaseError)) {
      err = new DatabaseError(err.message, 'DB_ERROR');
    }
    throw err;
  });
}

function newWeapon(charId, weapon) {}

function checkNull(value) {
  return value ? value : null;
}

function parseArray(array) {
  if (array.length === 1) {
    return array[0];
  } else {
    return array[0] + ' - ' + array[array.length - 1];
  }
}
