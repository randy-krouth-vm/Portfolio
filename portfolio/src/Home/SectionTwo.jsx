import './SectionTwo.css'

function SectionTwo({ imageOne, imageOneText,
                      imageTwo, imageTwoText}) {
    return (
    <>
        <div id="section-two">
            <div id="section-two-left">
                <img src={imageOne} id="image-one" alt="Image One Placeholder"/>
                    <p id="image-one-text">{imageOneText}</p>
            </div>

            <div id="section-two-right">
                <img src={imageTwo} id="image-two" alt="Image Two Placeholder"/>
                    <p id="image-two-text">{imageTwoText}</p>
            </div>
        </div>
    </>
  );
}

export default SectionTwo;