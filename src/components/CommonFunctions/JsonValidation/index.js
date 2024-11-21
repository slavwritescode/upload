
import Ajv from 'ajv';
import main from './schemas/main';

const jsonValidation = (schemaName) => {

	let schema;
	switch (schemaName) {
		case 'main':
			schema = main;
			break;
		default:
			console.error('Schema not found');
			return false;
	}

	// const ajv = new Ajv({ allErrors: true, jsonPointers: true, $data: true, verbose: true, format: 'full' });
	const ajv = new Ajv({ allErrors: true, jsonPointers: true, $data: true, verbose: true });
	const validate = ajv.compile(schema);
	return validate;
}

export default jsonValidation;