import './App.sass';
import {useCallback, useEffect, useState} from "react";
import * as Compress from 'compress.js';
const compress = new Compress();
const isIOS = /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel')
const mapURL = isIOS ? "https://maps.apple.com/?q=" : "https://www.google.com/maps?q=";

const srng = new window.Math.seedrandom('samyok');

function App() {
    return (
        <>
            {window.location.pathname.includes('add') ? <AddEventForm/> : <Main/>}
            <div className="footer">Created by Samyok Nepal | <a target="_blank" href="https://github.com/samyok/gradparty">Github</a></div>
        </>
    );
}

const COLORS = [
    ["#a63238", "#ffc0c0",],
    ["#d38773", "#ffd0a5",],
    ["#76b488", "#bdffa7",],
    ["#4e84d5", "#b3e7ff",],
    ["#6b45a1", "#d2d6ff",],
];

function Main() {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetch('/data')
            .then(r => r.json())
            .then(r => setData(r))

        document.addEventListener('scroll', updateScrollHeaders);
        document.addEventListener('resize', updateScrollHeaders);

        function updateScrollHeaders(event) {
            let headers = Array.from(document.querySelectorAll('.eventHeader'));
            headers.forEach(a => a.classList.remove('sticky'));
            // get last negative Y coordinate
            let i = 0;
            while (i < headers.length - 1) {
                if (headers[i + 1].getBoundingClientRect().y > 0) {
                    break;
                }
                i++;
                // if the next one is positive (shows up on screen), than this is hte one we're lookign for

            }

            headers[i].classList.add('sticky');
            if (headers[i + 1] && headers[i + 1].getBoundingClientRect().y < headers[i + 1].offsetHeight) {
                headers[i].style.top = (headers[i + 1].getBoundingClientRect().y - headers[i + 1].offsetHeight) + "px";
            } else {
                headers[i].style.top = "0px";
            }
            // console.log(headers.map(a => ({header: a, height: a.offsetHeight, coords: a.getBoundingClientRect()})))
        }
    }, [])
    return (
        <div className="container">
            <h1>'21 Grad Parties</h1>
            <p>Add your graduation party to this list by clicking <a href="/add">here</a>! 🎓🎉</p>
            <p>Everyone's invited to the following open houses! Text me (605-592-6144) if anything needs changing.</p>
            <br/>
            <br/>
            {data.map((day, di) => {
                let colorArr = []
                while (colorArr.length < day.listings.length) {
                    let newColorIndex = COLORS.length * srng() >> 0;
                    if (colorArr.length > 0 && colorArr[colorArr.length - 1] === newColorIndex) {
                        continue;
                    }
                    console.log(colorArr);
                    colorArr.push(newColorIndex)
                }
                return <div key={di + JSON.stringify(day)}>
                    <h2 className="eventHeader">🎊 {day.name}</h2>
                    <br/>
                    {day.listings.map((listing, i) => <CalendarEvent listing={listing}
                                                                     colorIndex={colorArr[i]}
                                                                     key={i + JSON.stringify(listing)}/>)}
                    <br/>
                    <br/>
                </div>
            })}

        </div>
    )
}

function CalendarEvent({listing, colorIndex}) {
    let color = COLORS[colorIndex];
    return (
        <div className="event row"
             style={{
                 flexWrap: "nowrap",
                 borderLeft: `3px solid ${color[0]}`,
                 backgroundColor: color[1]
             }}>
            {!!listing.image && <img src={listing.image} alt="event avatar" style={{marginRight: 10}}/>}
            <div>
                <h3>{listing.name}</h3>
                <div className="row">
                    <pre style={{paddingRight: 20}}>{listing.timeString}</pre>
                    <p>{listing.description}</p>
                </div>
                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                <a target="_blank"
                   href={mapURL + listing.address}>📍 {listing.address}</a>
            </div>
        </div>
    )
}

function AddEventForm() {
    const [desc, setDesc] = useState("");
    const submitForm = useCallback(() => {
        let file = document.querySelector("#upload")?.files[0];
        if (!file) {
            if (window.confirm("Are you sure you don't want to submit an image?"))
                return submitForm(null);
            else return;
        }

        compress.compress([file], {
            maxWidth: 300,
            maxHeight: 300,
            resize: true,
        }).then((data) => {
            console.log(data);
            submitForm(data[0].prefix + data[0].data)
        })

        // let reader = new FileReader();
        // reader.onload = e => {
        //     let image = e.target.result;
        //     submitForm(image)
        // }
        // reader.readAsDataURL(file);

        function submitForm(image) {
            fetch("/submit", {
                method: "POST", headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: desc,
                    name: document.querySelector("#eventName").value,
                    day: document.querySelector("#day").value,
                    startTime: document.querySelector("#startTime").value,
                    endTime: document.querySelector("#endTime").value,
                    address: document.querySelector("#address").value,
                    phoneNumber: document.querySelector("#phonenumber").value,
                    image,
                })
            })
                .then(r => r.json())
                .then(r => {
                    if (r.success) {
                        alert("Added event successfully!");
                        window.location.href = "/"
                    } else {
                        alert(r.error);
                    }
                })

        }

    }, [desc])
    return <div className="container">
        <h1>'21 Grad Parties</h1>
        <p>Add your graduation party to this list by filling out the form below! 🎓🎉</p>

        <label htmlFor="eventName">
            Event Name *<input type="text" placeholder="Name of event" id="eventName"/>
        </label>

        <label htmlFor="day">
            Date *
            <input type="date" id="day"/>
        </label>

        <label htmlFor="startTime">
            Start Time *
            <input type="time" id="startTime"/>
        </label>

        <label htmlFor="endTime">
            End Time *
            <input type="time" id="endTime"/>
        </label>

        <label htmlFor="description">
            Description
            <LimitedTextarea limit={250} onChange={e => setDesc(e)}/>
        </label>

        <label htmlFor="address">
            Address (street AND city!) *
            <input type="text" id="address" placeholder="1600 Pennsylvania Avenue, Washington, D.C."/>
        </label>

        {/*<label htmlFor="upload">*/}
        {/*    Upload Image*/}
        {/*    <input type="file" id="upload"/>*/}
        {/*</label>*/}
        {/*<p>Note: Images will be warped to fit to a square if they are not already one!</p>*/}
        <label htmlFor="phonenumber">
            Submitter's Contact Phone Number *
            <input type="tel" id="phonenumber"/>
        </label>



        <button onClick={submitForm}>Post</button>
    </div>
}

const LimitedTextarea = ({
                             rows, cols, value = "", limit, onChange = () => {
    }
                         }) => {
    const [content, setContent] = useState(value.slice(0, limit));

    const setFormattedContent = useCallback(
        text => {
            setContent(text.slice(0, limit));
            onChange(text.slice(0, limit))
        },
        [limit, onChange]
    );

    return (
        <>
      <textarea
          rows={rows}
          cols={cols}
          onChange={event => setFormattedContent(event.target.value)}
          value={content}
          placeholder={`up to ${limit} characters`}
      />
            <span>
                {content.length}/{limit}
            </span>
        </>
    );
};


export default App;

