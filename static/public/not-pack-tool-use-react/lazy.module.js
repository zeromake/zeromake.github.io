import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';

export default function lazy(load) {
	let component = null;
	return props => {
		const [, update] = useState(false);
        useEffect(() => {
            if (component !== null) return;
            load().then((m) => {
                component = m.default || m;
                update(true);
            });
        }, []);
        return component !== null ? h(component, props) : null;
	};
}
