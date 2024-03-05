import moment from "moment";

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
    /*
    {
        id: "IxSgrWZdcq8B6yNXmzboZ",
        desc: "Test Shift",
        start: "15:00",
        end:   "15:15",
        employees: ["3C4XnbQJLbTZ6GRAAwx1F"]
    },
    {
        id: "IxSgrWZdcq8B6yNXmzboA",
        desc: "Test Shift 2",
        start: "14:00",
        end:   "16:00",
        employees: ["3C4XnbQJLbTZ6GRAAwx1F"]
    },
    */
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
    /*
    {
        id: "pPXmBakMG6e6PgllmZzQ6",
        desc: "Test Break",
        start: "16:08",
        end:   "16:43",
        employees: ["c444AUe057uwxV4cxoNyT"]
    },
    */
    
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
  /*
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
  */
]



export const services = [
    {
        id: "VDwZ7TXS5cbWKDbGJG3v1",
        desc: "Haircut",
        duration: "20",
    },
    {
        id: "VDwZ7TTS5cbWKDbGJG3v1",
        desc: "Hair Colouring",
        duration: "45",
    },
    {
        id: "VDwZ7T5S5cbWK3bGJG3v1",
        desc: "Peticure",
        duration: "60",
    },
]

/*
appointment schema:
id: (nanoId)
customer_id: (customerId)
type: (enum "haircut", "haircolor", "nails", etc)
customer_email: ".." used to notify customer of appointment updates
date: (date/ start time of appointment)
status: (CONFIRMED, REQUESTED, IN_PROGRESS, CANCELED, COMPLETED)
assigned_to: (employeeID)
creation_type: (ONLINE, MANUAL) 
  manual appointments are created in-system by employees
  online appointments are created by customers using the form
    online appointments require an email (or a phone number)
    so the user can   


    const t =  moment()
    //6 Mar 2017 21:22:23 GMT
    console.log("moment date:", t)
    console.log("moment hr:", t.hour())
    console.log("moment minute:", t.minute())
    console.log("moment second:", t.second())

    const mt =  moment("4 Mar 2024 13:00:00 GMT")
    console.log("mt date:",mt)
    console.log("mt hr:", mt.hour())
    console.log("mt minute:", mt.minute())
    console.log("mt second:", mt.second())


*/

export const appointments =  [
    {
        id: "3C42nbQJLbTZ6GRAAwx10", //0
        date: moment()._d,
        start:"8:40",
        end: "8:55",
        customer_id: "Bob",
        customer_email: "...",
        service_id: "VDwZ7TXS5cbWKDbGJG3v1",//haircut
        status: "CONFIRMED",
        assigned_to: "3C4XnbQJLbTZ6GRAAwx1F" //Tom
    },
    {
        id: "VDwZ7TXS5cbWKDbGJG8v1", //1
        date: moment()._d,
        start:"10:00",
        end: "10:15",
        customer_id: "Jack",
        customer_email: "...",
        service_id: "VDwZ7TXS5cbWKDbGJG3v1",//haircut
        status: "CONFIRMED",
        assigned_to: "VDwZ7TXS5cbWKDbGJG8vD" //John
    },
    {
        id: "ayHDCRR5fL0Hr7w3pRHF2", //2
        date: moment()._d,
        start:"11:15",
        end: "11:30",
        customer_id: "Peter",
        customer_email: "...",
        service_id: "VDwZ7TTS5cbWKDbGJG3v1", //coloring
        status: "REQUESTED",
        assigned_to: "" //
    },
    {
        id: "c444AUe057uwxV4cxoNy3", //3
        date: moment()._d,
        start:"12:30",
        end: "12:55",
        customer_id: "Mary",
        customer_email: "...",
        service_id: "VDwZ7T5S5cbWK3bGJG3v1", //peticure
        status: "COMPLETED",
        assigned_to: "c444AUe057uwxV4cxoNyT" //gina
    },

    {
        id: "c444AUe057uwxV4cxoNy4", //4
        date: moment()._d,
        start:"13:30",
        end: "14:00",
        customer_id: "Mike",
        customer_email: "...",
        service_id: "VDwZ7T5S5cbWK3bGJG3v1", //peticure
        status: "REQUESTED",
        assigned_to: "" 
    },

    {
        id: "c444AUe057uwxV4cxoNy5", //5
        date: moment()._d,
        start:"09:30",
        end: "10:00",
        customer_id: "Josh",
        customer_email: "...",
        service_id: "VDwZ7T5S5cbWK3bGJG3v1", //peticure
        status: "CONFIRMED",
        assigned_to: "ayHDCRR5fL0Hr7w3pRHFP" 
    },
]
  