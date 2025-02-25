// These are the four numbers that define the transform
const axis = {
	x: {
		x: 1,
		y: 0.5
	}, 
	y: {
		x: -1,
		y: 0.5
	}
};

function to_screen_coordinate(tile) {
	return {
		x: tile.x * axis.x.x * (0.5 * w) + tile.y * axis.y.x * (0.5 * w),
		y: tile.x * axis.x.y * (0.5 * h) + tile.y * axis.y.y * (0.5 * h),
	}
}

// Going from screen coordinate to grid coordinate

function invert_matrix(a, b, c, d) {
	// Determinant 
	const det = (1 / (a * d - b * c));

	return {
		a: det * d,
		b: det * -b,
		c: det * -c,
		d: det * a,
	}
}

function to_grid_coordinate(screen) {
	const a = axis.x.x * (0.5 * w);
	const b = axis.y.x * (0.5 * w);
	const c = axis.x.y * (0.5 * h);
	const d = axis.y.y * (0.5 * h);
	
	const inv = invert_matrix(a, b, c, d);
	
	return {
		x: Math.floor(screen.x * inv.a + screen.y * inv.b - .5),
		y: Math.floor(screen.x * inv.c + screen.y * inv.d + .3),
	}
}