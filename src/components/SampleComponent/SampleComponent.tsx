import React from 'react';

import './SampleComponent.scss';

interface ISampleComponentProps {
	placeholder: string,
	onChange: (text:string) => void
}

interface ISampleComponentState {
	value: string
}

export class SampleComponent extends React.Component<ISampleComponentProps, ISampleComponentState> {

	constructor(props: ISampleComponentProps) {
		super(props);

		this.state = {
			value: ''
		}
	}

	render() {
		return (
			<input className="sample-component" type="text" placeholder={this.props.placeholder} onChange={(e) => this.onTextChanged(e.target.value)} value={this.state.value}/>
		)
	}

	onTextChanged(text:string) {
		this.setState({value: text})
		this.props.onChange(text);
	}
}