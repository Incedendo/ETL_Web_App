export const caseAdmin = `'READ/WRITE' as PRIVILEGE`;

export const caseOperator = `CASE
    WHEN AA.USERNAME IS NOT NULL
    THEN 'READ/WRITE'
    ELSE 'READ ONLY'
END AS PRIVILEGE`;

export const steps = 10;