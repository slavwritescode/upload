import PropTypes from 'prop-types';
import Constants from '../../Constants';
import './index.css';
const Label = ({ multifieldData, type, onClick, name }) => {
    console.log(multifieldData, 'is multiFieldData');
    return multifieldData
        .sort((a, b) => multifieldData[a].localeCompare(multifieldData[b]))
        .map(item => {
            if (type === 'button') {
                return <input
                    type={"button"}
                    className={`button ${(multifieldData || []).includes(parseInt(item)) ? 'red' : 'green'}`}
                    key={item}
                    onClick={onClick}
                    name={name}
                    value={Constants['lighting'][item]} />
            }
            return <input
                key={item + '-key'}
                checked={(multifieldData || []).includes(parseInt(item))}
                value={item}
                id={item + '-key'} />

        })
}

Label.propTypes = {
    multifieldData: PropTypes.array,
    type: PropTypes.oneOf(['button', 'div']).isRequired,
    onClick: PropTypes.func,
    name: PropTypes.node,
    className: PropTypes.string,
};

export default Label