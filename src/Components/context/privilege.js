export const caseAdmin = `'READ/WRITE' as PRIVILEGE`;

export const caseOperator = `CASE
    WHEN AA.USERNAME IS NOT NULL
    THEN 'READ/WRITE'
    ELSE 'READ ONLY'
END AS PRIVILEGE`;

export const selectCount = `SELECT COUNT(*) as COUNT`;

export const steps = 10;
export const startingLo = 1;
export const startingHi = steps;