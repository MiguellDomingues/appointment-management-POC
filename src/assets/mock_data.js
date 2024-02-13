

export const employees =  [
    {
        id: "3C4XnbQJLbTZ6GRAAwx1F", //0
        name: "Tom"
    },
    {
        id: "VDwZ7TXS5cbWKDbGJG8vD", //1
        name: "John"
    },
    {
        id: "ayHDCRR5fL0Hr7w3pRHFP", //2
        name: "Pam"
    },
    {
        id: "c444AUe057uwxV4cxoNyT", //3
        name: "Gina"
    },
]
  

export const shifts = [
    {
        id: "IxSgrWZdcq8B6yNXmzboL",
        desc: "Mon to Thur All Day Shift",
        start: "08:00",
        end:   "17:00",
        employees: ["3C4XnbQJLbTZ6GRAAwx1F","VDwZ7TXS5cbWKDbGJG8vD","ayHDCRR5fL0Hr7w3pRHFP"]
    },
    {
        id: "IOKsQFlBDbtw3-ctmXOFB",
        desc: "Ginas Afternoon Shift",
        start: "12:00",
        end:   "17:00",
        employees: ["c444AUe057uwxV4cxoNyT"]
    },
    {
        id: "bR08tv7xvtHUZsC75DZKF",
        desc: "Friday Shift",
        start: "09:00",
        end:   "14:00",
        employees: ["3C4XnbQJLbTZ6GRAAwx1F","VDwZ7TXS5cbWKDbGJG8vD","ayHDCRR5fL0Hr7w3pRHFP"]
    },
]

export const breaks = [
    {
        id: "U5EIYsGln7LIxsbe4crzc",
        desc: "Tom and Johns Morning Break",
        start: "09:00",
        end:   "09:15",
        employees: ["3C4XnbQJLbTZ6GRAAwx1F","VDwZ7TXS5cbWKDbGJG8vD"]
    },
    {
        id: "xMa7hnV3Iku3SHwDXJBKe",
        desc: "Afternoon Lunch",
        start: "12:00",
        end:   "13:00",
        employees: ["3C4XnbQJLbTZ6GRAAwx1F","VDwZ7TXS5cbWKDbGJG8vD","ayHDCRR5fL0Hr7w3pRHFP"]
    },
    {
        id: "iTDhPaPLAFgsLeCmXP4zP",
        desc: "Ginas Afternoon Break",
        start: "14:00",
        end:   "14:15",
        employees: ["c444AUe057uwxV4cxoNyT"]
    },
    {
        id: "pPXmBakMG6e6PgllmZzQ9",
        desc: "Fridays Break",
        start: "11:00",
        end:   "11:30",
        employees: ["3C4XnbQJLbTZ6GRAAwx1F","VDwZ7TXS5cbWKDbGJG8vD"]
    },
]

export const workDays = [
  {
      id: "dEtdIXW2Eyp07aYPdV8Qu",
      open: "08:00",
      close: "17:00",
      dotw: "Monday",
      shifts: ["IxSgrWZdcq8B6yNXmzboL","IOKsQFlBDbtw3-ctmXOFB"],
      breaks: ["U5EIYsGln7LIxsbe4crzc","xMa7hnV3Iku3SHwDXJBKe","iTDhPaPLAFgsLeCmXP4zP"]        
  },
  {
      id: "PIGDZX4oVcTgF9bITWNp9",
      open: "08:00",
      close: "17:00",
      dotw: "Tuesday",
      shifts: ["IxSgrWZdcq8B6yNXmzboL","IOKsQFlBDbtw3-ctmXOFB"],
      breaks: ["U5EIYsGln7LIxsbe4crzc","xMa7hnV3Iku3SHwDXJBKe","iTDhPaPLAFgsLeCmXP4zP"]       
  },
  {
      id: "D6hdoSSl35qqySVakKoC3",
      open: "08:00",
      close: "17:00",
      dotw: "Wednesday",
      shifts: ["IxSgrWZdcq8B6yNXmzboL","IOKsQFlBDbtw3-ctmXOFB"],
      breaks: ["U5EIYsGln7LIxsbe4crzc","xMa7hnV3Iku3SHwDXJBKe","iTDhPaPLAFgsLeCmXP4zP"]        
  },
  {
      id: "zG0qv3O3QhXttMerJeGPI",
      open: "08:00",
      close: "17:00",
      dotw: "Thursday",
      shifts: ["IxSgrWZdcq8B6yNXmzboL","IOKsQFlBDbtw3-ctmXOFB"],
      breaks: ["U5EIYsGln7LIxsbe4crzc","xMa7hnV3Iku3SHwDXJBKe","iTDhPaPLAFgsLeCmXP4zP"]        
  },
  {
      id: "flF2pOCqI_DXzLdR2hNCl",
      open: "09:00",
      close: "14:00",
      dotw: "Friday",
      shifts: ["bR08tv7xvtHUZsC75DZKF"],
      breaks: ["pPXmBakMG6e6PgllmZzQ9"]       
  },
]