export const caseAdmin = `'READ/WRITE' as PRIVILEGE`;

export const caseOperator = `CASE
    WHEN AA.USERNAME IS NOT NULL
    THEN 'READ/WRITE'
    ELSE 'READ ONLY'
END AS PRIVILEGE`;

export const selectCount = `SELECT COUNT(*) as COUNT`;

export const default_steps = 15;
export const startingLo = 1;
export const startingHi = default_steps;