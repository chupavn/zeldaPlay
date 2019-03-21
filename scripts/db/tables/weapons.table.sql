CREATE TABLE IF NOT EXISTS weapons (
  id VARCHAR(12) PRIMARY KEY DEFAULT createId('00W')
	,ammo INTEGER
	,created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
	,crit_damage INTEGER NOT NULL CONSTRAINT non_zero_crit_bonus CHECK (crit_damage > 0)
	,crit_range TEXT NOT NULL
	,damage INTEGER NOT NULL CONSTRAINT non_zero_damage CHECK (damage > 0)
	,last_modified_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
	,modifier attribute NOT NULL
	,name TEXT NOT NULL
	,number_of_hits INTEGER NOT NULL CONSTRAINT non_zero_dice_roll CHECK (number_of_hits > 0)
	,range INTEGER
	,type weapon_type NOT NULL
	,character_id VARCHAR(12) NOT NULL REFERENCES characters (id)
);
