import './Contact.css'

function Contact() {

    return (
    <>
        <div id="contact-main">
            <h1>Contact: </h1>

            <img src="Image_12.png" alt="Personal Image" />

                <a href="Randall_Krouth_Resume.pdf" target="_blank" rel="noopener noreferrer">View Resume PDF</a>

            </div>

            <img src="Image_13.png" id="contact-nav-tools" />

            <div id="contact-icons">
                <button aria-placeholder="" id="contact-upwork" onClick={() => window.open("https://www.upwork.com/freelancers/~01a6662184b7764860", "_blank", "noopener,noreferrer")} />
                <button aria-placeholder="" id="contact-credly" onClick={() => window.open("https://www.credly.com/users/randall-krouth/badges", "_blank", "noopener,noreferrer")} />
                <button aria-placeholder="" id="contact-linkedin" onClick={() => window.open("https://www.linkedin.com/in/randall-krouth-6a7957a0/", "_blank", "noopener,noreferrer")} />
            </div>
   </>
  );
} 

export default Contact;