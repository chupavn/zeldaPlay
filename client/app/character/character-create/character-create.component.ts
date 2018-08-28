import { Component, Input, OnInit } from '@angular/core';

import { AlertService } from '../../alert/alert.service';
import { MessageService } from '../../shared/messages/message.service';
import { CharacterService } from '../character.service';
import { Attribute } from '../characterModels/attribute';
import { Character } from '../characterModels/character';
import { Attributes } from '../characterModels/enums/attributes.enum';
import { Magics } from '../characterModels/enums/magic-skills.enum';
import { Skills } from '../characterModels/enums/skills.enum';
import { Weapons } from '../characterModels/enums/weapon-skills.enum';
import {
  Fairy,
  Gerudo,
  Goron,
  Hylian,
  Rito,
  Sheikah,
  Twili,
  Zora
} from '../characterModels/Races';
import { CharactersComponent } from '../characters.component';

@Component({
  selector: 'app-character-create',
  templateUrl: './character-create.component.html',
  styleUrls: ['./character-create.component.css']
})
export class CharacterCreateComponent implements OnInit {
  @Input()
  CharacterParent: CharactersComponent;

  skillPoints: number;
  originalPoints: number;

  error = false;

  attrMins: number[] = [];
  attrPrior: number[] = [];

  attPoints = 48;

  showRaceModal = false;

  showRace: boolean[] = [
    false, // Hylian 0
    false, // Goron 1
    false, // Zora 2
    false, // Gerudo 3
    false, // Sheikah 4
    false, // Rito 5
    false, // Twili 6
    false // Fairy 7
  ];

  skillsPrior: number[] = [];
  weaponSkillsPrior: number[] = [];
  magicSkillsPrior: number[] = [];

  nullSubRaceClasses = ['Sheikah', 'Gerudo', 'Twili'];

  newCharacter: Character;

  constructor(
    public message: MessageService,
    private alertService: AlertService,
    private characterService: CharacterService
  ) {}

  ngOnInit() {
    this.attrMins = [];
    this.attrPrior = [];
    this.skillsPrior = [];
    this.weaponSkillsPrior = [];
    this.magicSkillsPrior = [];

    this.newCharacter = new Character();
    this.originalPoints = this.skillPoints =
      ((Math.round(Math.random() * 100) % 4) + 1) * 5;
    for (const attr of this.newCharacter.attributes) {
      this.attrMins.push(attr.value);
    }
    /* for (let i = 0; i < this.newCharacter.attributes.length; i++) {
      this.attrMins.push(this.newCharacter.attributes[i].value);
    } */
  }

  aboutRace(): void {
    this.showRaceModal = !this.showRaceModal;
  }

  show(race: number): void {
    for (let i = 0; i < this.showRace.length; i++) {
      this.showRace[i] = false;
    }
    this.showRace[race] = true;
  }

  save(): void {
    let nullSubRace = false;
    if (!this.nullSubRaceClasses.includes(this.newCharacter.race)) {
      nullSubRace = this.newCharacter.subRace ? false : true;
    }
    if (
      this.newCharacter.name != null &&
      (this.skillPoints === 0 && this.attPoints === 0) &&
      !nullSubRace
    ) {
      this.newCharacter.maxHealth = this.newCharacter.health =
        48 + this.newCharacter.attributes[2].modifier;
      this.newCharacter.maxMagic = this.newCharacter.magic =
        20 + this.newCharacter.attributes[4].modifier;
      this.CharacterParent.newChar = false;
      this.CharacterParent.characters.push(this.newCharacter);
      this.CharacterParent.selectedCharacter = this.newCharacter;
      this.createMessage();
    } else {
      this.error = true;
    }
    if (!this.error) {
      if (localStorage.getItem('currentUser')) {
        // save character to database
        this.characterService
          .saveCharDb(this.newCharacter)
          .subscribe((characterRes) => {
            const newChar = this.CharacterParent.selectedCharacter;
            newChar.id = characterRes.id;
            for (const skill of characterRes.skills) {
              if (skill.skill_type === 'skill') {
                newChar.skills[Skills[skill.name]].id = skill.id;
              } else if (skill.skill_type === 'weapon') {
                newChar.weaponSkills[Weapons[skill.name]].id = skill.id;
              } else {
                newChar.magicSkills[Magics[skill.name]].id = skill.id;
              }
            }
            for (const weapon of characterRes.weapons) {
              newChar.weapons[
                findObjectPartial(newChar.weapons, 'name', weapon.name)
              ].id = weapon.id;
            }
            for (const spell of characterRes.spells) {
              newChar.spells[
                findObjectPartial(newChar.spells, 'name', spell.name)
              ].id = spell.id;
            }
            for (const save of characterRes.saves) {
              newChar.savingThrows[
                findObjectPartial(newChar.savingThrows, 'name', save.name)
              ].id = save.id;
            }
            for (const note of characterRes.notes) {
              if (note.important) {
                newChar.importantNotes[
                  findObjectPartial(newChar.importantNotes, 'msg', note.message)
                ].id = note.id;
              } else {
                newChar.notes[
                  findObjectPartial(newChar.notes, 'msg', note.message)
                ].id = note.id;
              }
            }
          });
      } else {
        this.alertService.error(
          'You must be logged in to save your character for re-use.'
        );
      }
    } else {
      this.alertService.error('There was a problem with saving the character.');
    }
  }

  cancel(): void {
    this.CharacterParent.newChar = false;
    this.newCharacter = null;
  }

  raceChange(): void {
    const raceTemp = this.newCharacter.race;
    switch (this.newCharacter.race) {
      case 'Hylian': {
        this.newCharacter = new Hylian(
          this.newCharacter.subRace ? this.newCharacter.subRace : null
        );
        break;
      }
      case 'Goron': {
        this.newCharacter = new Goron(
          this.newCharacter.subRace ? this.newCharacter.subRace : null
        );
        break;
      }
      case 'Zora': {
        this.newCharacter = new Zora(
          this.newCharacter.subRace ? this.newCharacter.subRace : null
        );
        break;
      }
      case 'Gerudo': {
        this.newCharacter = new Gerudo();
        break;
      }
      case 'Sheikah': {
        this.newCharacter = new Sheikah();
        break;
      }
      case 'Rito': {
        this.newCharacter = new Rito(
          this.newCharacter.subRace ? this.newCharacter.subRace : null
        );
        break;
      }
      case 'Twili': {
        this.newCharacter = new Twili();
        break;
      }
      case 'Fairy': {
        this.newCharacter = new Fairy(
          this.newCharacter.subRace ? this.newCharacter.subRace : null
        );
        break;
      }
    }
    this.resetPriors();
    this.attPoints = 48;
    this.skillPoints = this.originalPoints;
    this.newCharacter.race = raceTemp;
    this.newCharacter.level = 1;
    this.newCharacter.exp = 0;
  }

  resetPriors(): void {
    for (let i = 0; i < this.newCharacter.attributes.length; i++) {
      this.attrMins[i] = this.newCharacter.attributes[i].value;
    }
    for (let j = 0; j < this.attrPrior.length; j++) {
      this.attrPrior[j] = null;
    }
    for (let k = 0; k < this.skillsPrior.length; k++) {
      this.skillsPrior[k] = null;
    }
    for (let m = 0; m < this.weaponSkillsPrior.length; m++) {
      this.weaponSkillsPrior[m] = null;
    }
    for (let n = 0; n < this.magicSkillsPrior.length; n++) {
      this.magicSkillsPrior[n] = null;
    }
  }

  calcMod(stat: Attribute): void {
    stat.modifier =
      stat.value % 2 === 0 ? (stat.value - 10) / 2 : (stat.value - 11) / 2;
  }

  getMod(modName: string): number {
    return this.newCharacter.attributes[Attributes[modName]].modifier;
  }

  closeError(): void {
    this.error = false;
  }

  trackAtt(attrIndex: number): void {
    const val = this.newCharacter.attributes[attrIndex].value;
    const modifier = val % 2 === 0 ? (val - 10) / 2 : (val - 11) / 2;
    this.newCharacter.attributes[attrIndex].modifier = modifier;
    /* if (this.attrPrior[attrIndex]) {
      this.attPoints = this.attPoints - (val - this.attrPrior[attrIndex]);
    } else {
      this.attPoints = this.attPoints - (val - this.attrMins[attrIndex]);
    } */
    this.attPoints -=
      val -
      (this.attrPrior[attrIndex]
        ? this.attrPrior[attrIndex]
        : this.attrMins[attrIndex]);
    this.attrPrior[attrIndex] = val;
  }

  track(index: number, type: string): void {
    const val = this.newCharacter[type][index].ranks;
    const PRIOR = 'Prior';
    /* if (this[type + PRIOR][index]) {
      this.skillPoints = this.skillPoints - (val - this[type + PRIOR][index]);
    } else {
      this.skillPoints = this.skillPoints - val;
    } */
    this.skillPoints -=
      val - (this[type + PRIOR][index] ? this[type + PRIOR][index] : 0);
    this[type + PRIOR][index] = val;
  }

  validateAttr(attrIndex: number): void {
    const input = document.getElementById('attr' + attrIndex);
    if (
      this.newCharacter.attributes[attrIndex].value < this.attrMins[attrIndex]
    ) {
      input.classList.add('bad-input');
      this.attPoints +=
        this.newCharacter.attributes[attrIndex].value -
        this.attrMins[attrIndex];
      this.attrPrior[attrIndex] = this.newCharacter.attributes[
        attrIndex
      ].value = this.attrMins[attrIndex];
    } else if (this.attPoints < 0) {
      input.classList.add('bad-input');
      this.newCharacter.attributes[attrIndex].value += this.attPoints;
      this.attrPrior[attrIndex] = this.newCharacter.attributes[attrIndex].value;
      this.attPoints -= this.attPoints;
    } else if (input.classList.contains('bad-input')) {
      input.classList.remove('bad-input');
    }
  }

  validate(index: number, type: string): void {
    const input = document.getElementById(type + index);
    const PRIOR = 'Prior';
    if (this.newCharacter[type][index].ranks < 0) {
      input.classList.add('bad-input');
      this.skillPoints += this.newCharacter[type][index].ranks;
      this[type + PRIOR][index] = this.newCharacter[type][index].ranks = 0;
    } else if (this.skillPoints < 0) {
      input.classList.add('bad-input');
      this.newCharacter[type][index].ranks += this.skillPoints;
      this[type + PRIOR][index] = this.newCharacter[type][index].ranks;
      this.skillPoints -= this.skillPoints;
    } else if (input.classList.contains('bad-input')) {
      input.classList.remove('bad-input');
    }
  }

  resetSkills(): void {
    for (const skill of this.newCharacter.skills) {
      skill.ranks = 0;
    }
    /* for (let i = 0; i < this.newCharacter.skills.length; i++) {
      this.newCharacter.skills[i].ranks = 0;
    } */
    for (const wep of this.newCharacter.weaponSkills) {
      wep.ranks = 0;
    }
    /* for (let i = 0; i < this.newCharacter.weaponSkills.length; i++) {
      this.newCharacter.weaponSkills[i].ranks = 0;
    } */
    for (const mag of this.newCharacter.magicSkills) {
      mag.ranks = 0;
    }
    /* for (let i = 0; i < this.newCharacter.magicSkills.length; i++) {
      this.newCharacter.magicSkills[i].ranks = 0;
    } */
    this.resetPriors();
    this.skillPoints = this.originalPoints;
  }

  createMessage(): void {
    const name = this.newCharacter.name;
    const race = this.newCharacter.race;
    const subRace = this.newCharacter.subRace
      ? this.newCharacter.subRace + ' '
      : '';
    const message = name + ' the ' + subRace + race + ' was created.';

    this.message.add(message);
  }
}

function findObjectPartial(array, key, value): number {
  let index = -1;
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      index = i;
      break;
    }
  }
  return index;
}
